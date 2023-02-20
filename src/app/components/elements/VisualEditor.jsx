import React, { Component } from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';

let RichTextEditor;
if (process.env.BROWSER) {
    // eslint-disable-next-line global-require
    RichTextEditor = require('react-rte').default;
}

class VisualEditor extends Component {

    static propTypes = {
        onChange: PropTypes.func
    };

    constructor(props) {
        super(props);

        const state = {};

        if (RichTextEditor) {
            if (props.value) {
                state.value = RichTextEditor.createValueFromString(props.value, 'markdown');
            } else {
                state.value = RichTextEditor.createEmptyValue();
            }
        }

        this.state = state;

    }

    // handleVoiceToText = (text) => {
    //     const newValue = RichTextEditor.createValueFromString(text, 'markdown');
    //     this.setState({ value: newValue } );
    //     if (this.props.onChange) {
    //         this.props.onChange(newValue.toString('markdown'));
    //     }

    //     console.log('handlevoice: ' + this.state);
    // };

    onChange = (value) => {
        this.setState({ value });
        if (this.props.onChange) {
            this.props.onChange(value.toString('markdown'));
        }
    };

    render() {
        var final_transcript = '';
        var recognizing = false;
        var ignore_onend;
        var start_timestamp;

        const textToMarkdown = () => {
            const text = document.getElementById('final_span').innerText;
            console.log(text);
            const newValue = RichTextEditor.createValueFromString(this.props.value + " " + text, 'markdown');
            this.setState({ value: newValue } );

            if (this.props.onChange) {
                this.props.onChange(newValue.toString('markdown'));
            }
        };

        // $.get( "https://raw.githubusercontent.com/neocarvajal/language-json/main/data.json", ( response ) => {
        //     let cList = $('#language');
        //     let data = JSON.parse(response);

        //     $.each(data, function(i) {
        //         var option = $('<option/>')
        //             .attr('value', data[i].code)
        //             .html(data[i].name)
        //             .appendTo(cList);
        //     });
        // });

        if (!('webkitSpeechRecognition' in window)) {
            message.innerHTML = 'Web Speech API is not supported by this browser. Upgrade to <a href="//www.google.com/chrome">Chrome</a> version 25 or later.';
        } else {
            var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = function () {
                recognizing = true;
                message.innerHTML = 'Speak now.';
                talk_button.innerHTML = 'Listen';
            };

            recognition.onresult = function (event) {
                var interim_transcript = '';
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                    }
                }
                final_span.innerHTML = final_transcript;
                interim_span.innerHTML = interim_transcript;
            };

            recognition.onend = function () {

                recognizing = false;
                if (ignore_onend) {
                    return;
                }
                speechMyText(final_transcript);
                if (!final_transcript) {
                    message.innerHTML = 'Click "Talk" and begin speaking.';
                    talk_button.innerHTML = 'Talk';
                    return;
                }
            };

            recognition.onerror = function (event) {
                if (event.error == 'no-speech') {
                    message.innerHTML = 'No speech was detected.';
                    ignore_onend = true;
                }
                if (event.error == 'audio-capture') {
                    message.innerHTML = 'No microphone was found. Ensure that a microphone is installed.';
                    ignore_onend = true;
                }
                if (event.error == 'not-allowed') {
                    if (event.timeStamp - start_timestamp < 100) {
                        message.innerHTML = 'Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream';
                    } else {
                        message.innerHTML = 'Permission to use microphone was denied.';
                    }
                    ignore_onend = true;
                }
            };

            // recognition.start();
        }

       const talkWithHive = (event) => {
            if (recognizing) {
                recognition.stop();
                message.innerHTML = 'Click "Talk" and begin speaking.';
                talk_button.innerHTML = 'Talk';
                return;
            }
            final_transcript = '';
            recognition.lang = 'es';
            recognition.start();
            ignore_onend = false;
            final_span.innerHTML = '';
            interim_span.innerHTML = '';
            message.innerHTML = 'Click the "Allow" button above to enable your microphone.';
            start_timestamp = event.timeStamp;
        };

       const speechMyText = (textToSpeech) => {
            var u = new SpeechSynthesisUtterance();
            u.text = textToSpeech;
            u.lang = 'es';
            u.rate = 1.0;
            u.onend = function (event) {};
            speechSynthesis.speak(u);
        };

        const customControls = [
            () => { return (
                <>
                    <div className="container">
                        <div id="message" className="message">Click "Talk" and begin speaking.</div>
                        <div className="todo"> <span id="final_span" className="final"></span>
                            <span id="interim_span" className="interim"></span>
                        </div>
                        <div className="form-control">
                            <button
                                id="talk_button"
                                type="button"
                                key="talk"
                                className="btn btn-default IconButton__root___3tqZW Button__root___1gz0c"
                                onClick={event => talkWithHive(event)}
                            >
                                Talk
                            </button>
                            <button
                                type="button"
                                key="toggle"
                                className="btn btn-default IconButton__root___3tqZW Button__root___1gz0c"
                                onClick={textToMarkdown}
                            >
                                Texto a Markdown
                            </button>
                            {/* <select id="language" className="select" defaultValue="Select Your Language">
                                <option>Select Your Language</option>
                            </select> */}
                        </div>
                    </div>
                </>
            ); }
        ];

        const toolbarConfig = {
            // Optionally specify the groups to display (displayed in the order listed).
            display: [
              "INLINE_STYLE_BUTTONS"
            ],
            INLINE_STYLE_BUTTONS: [
              { label: "Bold", style: "BOLD", className: "custom-css-class" },
              { label: "Italic", style: "ITALIC" },
              { label: "Underline", style: "UNDERLINE" },
              {
                label: "Strikethrough",
                style: "STRIKETHROUGH"
              }
            ]
        };

        return (
            <div className="visual-editor">
                {RichTextEditor && (
                    <RichTextEditor
                        value={this.state.value}
                        onChange={this.onChange}
                        customControls={customControls}
                        toolbarConfig={toolbarConfig}
                    />
                )}
            </div>
        );
    }
}

export default VisualEditor;
