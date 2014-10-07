/*
MICROSOFT LIMITED PUBLIC LICENSE version 1.1
--------------------------------------------

This license governs use of code marked as "sample" or "example" available on this web site without a license agreement, as provided under the section above titled "NOTICE SPECIFIC TO SOFTWARE AVAILABLE ON THIS WEB SITE." If you use such code (the "software"), you accept this license. If you do not accept the license, do not use the software.

1. Definitions
The terms "reproduce," "reproduction," "derivative works," and "distribution" have the same meaning here as under U.S. copyright law. 
A "contribution" is the original software, or any additions or changes to the software.
A "contributor" is any person that distributes its contribution under this license.
"Licensed patents" are a contributor's patent claims that read directly on its contribution.

2. Grant of Rights
(A) Copyright Grant - Subject to the terms of this license, including the license conditions and limitations in section 3, each contributor grants you a non-exclusive, worldwide, royalty-free copyright license to reproduce its contribution, prepare derivative works of its contribution, and distribute its contribution or any derivative works that you create.
(B) Patent Grant - Subject to the terms of this license, including the license conditions and limitations in section 3, each contributor grants you a non-exclusive, worldwide, royalty-free license under its licensed patents to make, have made, use, sell, offer for sale, import, and/or otherwise dispose of its contribution in the software or derivative works of the contribution in the software.

3. Conditions and Limitations
(A) No Trademark License- This license does not grant you rights to use any contributors' name, logo, or trademarks.
(B) If you bring a patent claim against any contributor over patents that you claim are infringed by the software, your patent license from such contributor to the software ends automatically.
(C) If you distribute any portion of the software, you must retain all copyright, patent, trademark, and attribution notices that are present in the software.
(D) If you distribute any portion of the software in source code form, you may do so only under this license by including a complete copy of this license with your distribution. If you distribute any portion of the software in compiled or object code form, you may only do so under a license that complies with this license.
(E) The software is licensed "as-is." You bear the risk of using it. The contributors give no express warranties, guarantees or conditions. You may have additional consumer rights under your local laws which this license cannot change. To the extent permitted under your local laws, the contributors exclude the implied warranties of merchantability, fitness for a particular purpose and non-infringement.
(F) Platform Limitation - The licenses granted in sections 2(A) and 2(B) extend only to the software or derivative works that you create that run directly on a Microsoft Windows operating system product, Microsoft run-time technology (such as the .NET Framework or Silverlight), or Microsoft application platform (such as Microsoft Office or Microsoft Dynamics).
*/

/// <summary>
/// Class: GUID
/// Random GUID generator
/// </summary>
/// <returns>var: guid</returns>
var GUID = new function () {
    this.generate = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    };
};

/// <summary>
/// Class: AudioPlayer
/// Play audio files.
/// </summary>
/// <returns></returns>
var AudioPlayer = new function () {
    this.play = function (audioSourceFilePath) {
        try {
            var audio = new Audio(audioSourceFilePath);
            audio.load();
            audio.play();
        }
        catch (err) {
            /*#DBG
            _TRACE(err.message);
            #DBG*/
        }
    };
};

/// <summary>
/// Enum: Possible states of NL Processor.
/// </summary>
var SpeechRecognizerAudioCaptureState = { "Unknown": 0, "Initializing": 1, "Listening": 2, "Thinking": 3, "Complete": 4, "Cancelling": 5, "Canceled": 6 };

/// <summary>
/// Enum: Possible states of view modes for a Windows Store App.
/// </summary>
var AppViewMode = { "SnapView": { "width": 320, "height": 0 }, "Landscape": { "width": 0, "height": 0 }, "Portrait": { "width": 0, "height": 0 } };

/// <summary>
/// Enum: Possible position for text area data overflow wrap.
///       start: Wrap overflowing content with ellipsis(...) at the start of the wrapped content. e.g. ---is a great day.
///       end: Wrap overflowing content with ellipsis(...) at the end of the wrapped content. e.g. Today is a...
/// </summary>
var DataOverflowWrapPosition = { "start": 0, "end": 1 };

/// <summary>
/// Enum: Earcons/sounds to play based on state of the speech recognizer
/// </summary>
var Earcons = { "StartListening": "ListeningEarcon.wav", "StartThinking": "DoneListeningEarcon.wav" };

/// <summary>
/// Class: Voice UI Control.
/// </summary>
(function () {
    "use strict";
    var controlClass = WinJS.Class.define(

        //#region Constructor
        function Control_ctor(element, options)  
        {
            // Attach VoiceUIControl to HTML element
            this.element = element || document.createElement("div"); 
            this.element.winControl = this;
            if (!this.element.id) {                
                this.element.id = "divVoiceUIControl_" + GUID.generate();                  
            }

            // Create reference for the control
            this._refDivVoiceUIControl = this.element;
            var refVoiceUIControl = this._refDivVoiceUIControl;           

            // Set user-defined options
            WinJS.UI.setOptions(this, options);
                        
            // Set TabIndex on control, 
            // so that the element can't be tabbed to (hence control won't interfere with client code tab sequence) 
            // but focus can be given to the element programmatically (using element.focus()).
            refVoiceUIControl.tabIndex = -1;
            // Set event handler to be executed whenever user taps somewhere on the screen outside VoiceUIControl
            refVoiceUIControl.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };           

            // Draw control layout
            // VoiceUIControl Bar            
            this._refDivVoiceUIControlBar = document.createElement("div");
            this._refDivVoiceUIControlBar.id = "divVoiceUIBar_" + GUID.generate();
            this._refDivVoiceUIControlBar.className = "voice-ui-control hidden";
            this._refDivVoiceUIControlBar.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            this.element.appendChild(this._refDivVoiceUIControlBar);
            // Text Area            
            this._refDivTextArea = document.createElement("div");
            this._refDivTextArea.id = "divVoiceUIControlVisualElementTextArea_" + GUID.generate();
            this._refDivTextArea.innerHTML = "";
            this._refDivTextArea.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            this._refDivVoiceUIControlBar.appendChild(this._refDivTextArea);
            // VUMeter            
            this._refDivVUMeter = document.createElement("div");
            this._refDivVUMeter.id = "divVoiceUIControlVisualElementVUMeter_" + GUID.generate();
            this._refDivVUMeter.innerHTML = "";
            this._refDivVUMeter.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            this._refDivVoiceUIControlBar.appendChild(this._refDivVUMeter);
            // Scramble Text            
            this._refDivScrambleText = document.createElement("div");
            this._refDivScrambleText.id = "divVoiceUIControlVisualElementScrambleText_" + GUID.generate();
            this._refDivScrambleText.innerHTML = "";
            this._refDivScrambleText.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            this._refDivVoiceUIControlBar.appendChild(this._refDivScrambleText);
            // Garbage Text            
            this._refDivGarbageText = document.createElement("div");
            this._refDivGarbageText.id = "divVoiceUIControlVisualElementGarbageText_" + GUID.generate();
            this._refDivGarbageText.innerHTML = "";
            this._refDivGarbageText.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            this._refDivVoiceUIControlBar.appendChild(this._refDivGarbageText);
            // Gradient Text                        
            this._refDivGradientText = document.createElement("div");
            this._refDivGradientText.id = "divVoiceUIControlVisualElementGradientText_" + GUID.generate();
            this._refDivGradientText.innerHTML = "";
            this._refDivGradientText.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            this._refDivVoiceUIControlBar.appendChild(this._refDivGradientText);
            // Control Actions
            var divControlActions = document.createElement("div");
            divControlActions.id = "divVoiceUIControlActions_" + GUID.generate();
            divControlActions.className = "voice-ui-control-actions";
            divControlActions
            this._refDivVoiceUIControlBar.appendChild(divControlActions);
            // Go Button            
            this._refDivControlActionsGo = document.createElement("button");
            this._refDivControlActionsGo.id = "btnVoiceUIControlGo_" + GUID.generate();
            this._refDivControlActionsGo.className = "win-gobutton hidden";            
            this._refDivControlActionsGo.onclick = function () { refVoiceUIControl.winControl._goButtonClick(); };
            this._refDivControlActionsGo.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            divControlActions.appendChild(this._refDivControlActionsGo);
            // Cancel Button            
            this._refDivControlActionsCancel = document.createElement("button");
            this._refDivControlActionsCancel.id = "divControlActionsCancel_" + GUID.generate();
            this._refDivControlActionsCancel.className = "win-cancelbutton hidden";            
            this._refDivControlActionsCancel.onclick = function () { refVoiceUIControl.winControl._cancelButtonClick(); };
            this._refDivControlActionsCancel.onblur = function () { refVoiceUIControl.winControl._onBlurProcessing(); };
            divControlActions.appendChild(this._refDivControlActionsCancel);
        },
        //#endregion

        //#region Properties and methods for Voice UI Control
        {
            //#region Private Members                        
            _tips: {
                get: function () {
                    return this.tips;
                },
                set: function (value) {
                    this.tips = value;
                }
            },                                          // Sample tips provided by client app. These will be displayed on UX control as hints for the user.
            speechRecognizer: {
                get: function () {
                    return this._speechRecognizer;
                },
                set: function (varProcessor) {                    
                    this._attach(varProcessor);                    
                }
            },
            _currentVolumnLevel: 0,                     // Volumn level of current user input/speech
            _speechRecognizer: "",                      // Reference to SpeechRecognizer Object passed from client code
            _speechRecognizerCurrentState: "",          // Current state of NL Processor of type SpeechRecognizerAudioCaptureState
            _speechRecognizerCurrentHypothesis: "",     // Stores current hypothesis/intermediate results from NL Procesor for running seech recognition task.            
            _dispatcherTimer: "",                       // Stores reference to timer object to be used for periodic refresh of visualizations            
            _VolumnLevelSampleRate: 100,                // Rate at which volumn level should be sampled and visulalized using VUMeter (in ms.)   

            _refDivVoiceUIControl: "",                  // Reference to DIV on the APP that will host the VoiceUIControl inside it.	
            _refDivVoiceUIControlBar: "",               // Reference to DIV on the APP that will host the VoiceUIControl Grey Bar canvas inside it.	
            _refDivTextArea: "",                        // Reference to DIV on the APP that will host the Text Area/Hypothesis Area inside it.	
            _refDivVUMeter: "",                         // Reference to DIV on the APP that will host the VUMeter animation inside it.	
            _refDivScrambleText: "",                    // Reference to DIV on the APP that will host the Scrambled text inside it.	
            _refDivGarbageText: "",                     // Reference to DIV on the APP that will host the Garbage text inside it.	
            _refDivGradientText: "",                    // Reference to DIV on the APP that will host the Scrambled text with WHITE gradient inside it.	
            _refDivControlActionsGo: "",                // Reference to DIV on the APP that will host the "GO" Button inside it.	
            _refDivControlActionsCancel: "",            // Reference to DIV on the APP that will host the "CANCEL" Button inside it.	
            //#endregion      
            
            //#region Public Methods

            /// <summary>
            /// Attach the NL Processor instance to VoiceUIControl
            /// </summary>
            /// <param name="varProcessor">NL Processor object of type Microsoft.Bing.Speech.SpeechRecognizer</param>
            /// <returns></returns>            
            _attach: function (varProcessor) {
                
                /*#DBG
                _TRACE("Log: VoiceUIControl Attached ->");                   
                #DBG*/

                // Attach NL processor to VoiceUIControl
                this._speechRecognizer = varProcessor;
                if (this._speechRecognizer) {
                    // Initialize sub-elements of VoiceUIControl by passing references of corresponding HTML containers/DIVs that will host these elements.
                    TextArea.initialize(this._refDivTextArea, this.tips);
                    VUMeter.initialize(this._refDivVUMeter);
                    TextScramble.initialize(this._refDivScrambleText, this._refDivGarbageText, this._refDivGradientText);

                    var refVoiceUIControl = this._refDivVoiceUIControl;
                    // Attach event listeners to monitor events trigger by attached NL Processor.                       
                    // For events of audio level changes in user input/speech
                    this._speechRecognizer.addEventListener("audiolevelchanged", function (eventArgs) { refVoiceUIControl.winControl._naturalLanguageProcessorAudioLevelChanged(eventArgs); });
                    // For events of state changes in NL processor
                    this._speechRecognizer.addEventListener("audiocapturestatechanged", function (eventArgs) { refVoiceUIControl.winControl._naturalLanguageProcessorAudioCaptureStateChanged(eventArgs); });
                    // For events of intermediate results/hypothesis received by attached NL Processor
                    this._speechRecognizer.addEventListener("recognizerresultreceived", function (eventArgs) { refVoiceUIControl.winControl._naturalLanguageProcessorHypothesisChanged(eventArgs); });
                    // For events of parent App resize. This could be due to App being snap-viewed or change in device orientation.                    
                    window.addEventListener("resize", function (eventArgs) { refVoiceUIControl.winControl._evalVoiceUIControlPropertiesForCurrentMediaScreen(refVoiceUIControl); });                   
                    
                    // Set display properties as applicable for current orientation and resolution
                    refVoiceUIControl.winControl._evalVoiceUIControlPropertiesForCurrentMediaScreen(refVoiceUIControl);
                }

            },

            /// <summary>
            /// Activates VoiceUIControl and loads it on screen
            /// </summary>
            /// <param></param>
            /// <returns></returns> 
            _activate: function () {

                // Load UI Controls on screen - visible:True                
                this._refDivVoiceUIControlBar.className = "voice-ui-control visible";
                this._refDivControlActionsGo.className = "win-gobutton visible";
                this._refDivControlActionsCancel.className = "win-cancelbutton hidden";

                // Get focus on VoiceUIControl
                this._refDivVoiceUIControl.hideFocus = true;
                this._refDivVoiceUIControl.focus();

            },

            /// <summary>
            /// Detach the NL Processor instance from VoiceUIControl
            /// </summary>            
            _detach: function () {

                /*#DBG
                _TRACE("Log: VoiceUIControl Detached.");                
                #DBG*/
                                                        
                var refVoiceUIControl = this._refDivVoiceUIControl;
                // Detach NL Processor event listeners                                
                if (this._speechRecognizer) {
                    this._speechRecognizer.removeEventListener("audiolevelchanged", function (eventArgs) { refVoiceUIControl.winControl._naturalLanguageProcessorAudioLevelChanged(eventArgs); });
                    this._speechRecognizer.removeEventListener("audiocapturestatechanged", function (eventArgs) { refVoiceUIControl.winControl._naturalLanguageProcessorAudioCaptureStateChanged(eventArgs); });
                    this._speechRecognizer.removeEventListener("recognizerresultreceived", function (eventArgs) { refVoiceUIControl.winControl._naturalLanguageProcessorHypothesisChanged(eventArgs); });
                }
                // Detach App resize events
                window.removeEventListener("resize", function (eventArgs) { refVoiceUIControl.winControl._evalVoiceUIControlPropertiesForCurrentMediaScreen(refVoiceUIControl); });               
                                        
                // Detach NL Processor property of VoiceUIControl. Thus, control will stop observing NL Processor.
                this._speechRecognizer = "";
                                       
                TextScramble.destroy();
                VUMeter.destroy();
                TextArea.destroy();             

            },

            /// <summary>
            /// Deactivates VoiceUIControl and dismisses it from screen
            /// </summary>
            /// <param></param>
            /// <returns></returns
            _deactivate: function () {

                // Dismiss UI control from screen - visible:False
                this._refDivVoiceUIControlBar.className = "voice-ui-control hidden";
                this._refDivControlActionsGo.className = "win-gobutton hidden";
                this._refDivControlActionsCancel.className = "win-cancelbutton hidden";

                this._setSpeechRecognizerCurrentHypothesis("");

                // Remove focused from VoiceUIControl
                this._refDivVoiceUIControl.blur();
            },
            //#endregion

            //#region Private Methods            
            /// <summary>
            /// Capture the current audio level of the voice input  
            /// </summary>
            /// <param name="eventArgs">Event Arguments generated when the "audiolevelchanged" event occurs for attached NL Processor</param>
            /// <returns></returns>                      
            _naturalLanguageProcessorAudioLevelChanged: function (eventArgs) {
                
                this._setCurrentVolumnLevel(eventArgs.audioLevel);

            },
                        
            /// <summary>
            /// Transition through various states of Voice UI control based on stages in voice input processing, i.e. states of attached NL Processor
            /// </summary>
            /// <param name="eventArgs">Event Arguments generated when the "audiocapturestatechanged" event occurs for attached NL Processor</param>
            /// <returns></returns>  
            _naturalLanguageProcessorAudioCaptureStateChanged: function (eventArgs) {

                this._speechRecognizerCurrentState = eventArgs.state;
                if (eventArgs.state == SpeechRecognizerAudioCaptureState.Initializing) {
                    this._activate();
                }
                if (eventArgs.state == SpeechRecognizerAudioCaptureState.Listening) {                    
                    this._transitionToListening();
                }
                else if (eventArgs.state == SpeechRecognizerAudioCaptureState.Thinking) {
                    this._transitionToThinking();
                }
                else if (eventArgs.state == SpeechRecognizerAudioCaptureState.Complete || eventArgs.state == SpeechRecognizerAudioCaptureState.Canceled) {
                    this._transitionToComplete();
                }

            },
                        
            /// <summary>
            /// Capture the current Hypothesis from NL Processor
            /// </summary>
            /// <param name="eventArgs">Event Arguments generated when the "__________________" event occurs for attached NL Processor</param>
            /// <returns></returns>
            _naturalLanguageProcessorHypothesisChanged: function (eventArgs) {

                // If control is still in "Listening" state, display intermediate results on Text Area
                // It's possible for this method to be activated with an empty hypothesis, so we check for that here as well
                if ((this._speechRecognizerCurrentState == SpeechRecognizerAudioCaptureState.Listening) && eventArgs.isHypothesis) {

                    this._setSpeechRecognizerCurrentHypothesis(eventArgs.text);                                  
                    TextArea.setText(this._getSpeechRecognizerCurrentHypothesis());

                }

            },                                 
            
            /// <summary>
            /// Resturns value of _SpeechRecognizerCurrentHypothesis data memeber
            /// </summary>
            /// <param name=""></param>
            /// <returns>value of _SpeechRecognizerCurrentHypothesis</returns>
            _getSpeechRecognizerCurrentHypothesis: function () {

                return this._speechRecognizerCurrentHypothesis;

            },

            /// <summary>
            /// sets value of _SpeechRecognizerCurrentHypothesis data memeber
            /// </summary>
            /// <param name="value">new value to be set for _SpeechRecognizerCurrentHypothesis</param>
            /// <returns></returns>
            _setSpeechRecognizerCurrentHypothesis: function (value) {

                if (this._speechRecognizer && value != "") {
                    this._speechRecognizerCurrentHypothesis = value;
                }

            },
                        
            /// <summary>
            /// Based on current media screen orientation and resolution, set computational properties for the control and sub-elements. Changes to dimensional properties will be handled by CSS.
            /// </summary>
            /// <param name="refVoiceUIControl">reference to the HTML DIV that will be hosting VoiceUI custom control</param>
            /// <returns></returns>
            _evalVoiceUIControlPropertiesForCurrentMediaScreen: function (refVoiceUIControl) {

                if (this._speechRecognizerCurrentState == SpeechRecognizerAudioCaptureState.Listening) {

                    // Update text area for current media screen                
                    var varSpeechRecognizerCurrentHypothesis = refVoiceUIControl.winControl._getSpeechRecognizerCurrentHypothesis();
                    // When App loads and before we are to receive 1st hypothesis
                    if (varSpeechRecognizerCurrentHypothesis == "") {
                        TextArea.setTip();
                    }
                    // Reformatting for current hypothesis
                    else {
                        TextArea.setText(varSpeechRecognizerCurrentHypothesis);
                    }
                }

                // Update VUMeter properties for current media screen   
                // Here we compute number of columns of VUMeter; each with width 4 px, can fit in current width provided to VUMeter element by CSS media query.
                VUMeter.setSize(Math.floor(this._refDivVUMeter.offsetWidth / (4 * 2) + 1));

                /*#DBG
                _TRACE("VUMeter size is: " + this._refDivVUMeter.offsetWidth + " with columns: " + Math.floor(this._refDivVUMeter.offsetWidth / (4 * 2) + 1));
                _TRACE("Text Area size is: " + this._refDivTextArea.offsetWidth);
                #DBG*/
            },                       
            
            /// <summary>
            /// get current Volumn Level detected in VoiceUiControl
            /// </summary>            
            /// <returns>var: currentVolumnLevel</returns>
            _getCurrentVolumnLevel: function () {
                return this._currentVolumnLevel;
            },
            
            /// <summary>
            /// set current Volumn Level for VoiceUIControl
            /// </summary>
            /// <param name="volumnLevel">new value for volumn level</param>
            /// <returns></returns>
            _setCurrentVolumnLevel: function (volumnLevel) {
                this._currentVolumnLevel = volumnLevel;
            },
            
            /// <summary>
            /// Transition VoiceUIControl to "Listening" Mode
            /// </summary>
            /// <param name=""></param>
            /// <returns></returns>
            _transitionToListening: function () {

                // Play earcon audio to indicate that processor is ready to listen.
                AudioPlayer.play("Bing.Speech/earcons/" + Earcons.StartListening);

                // Setup visualization for the Listening state
                TextScramble.stopScramble();
                TextArea.setTip();
                var refVoiceUIControl = this._refDivVoiceUIControl; 
                this._dispatcherTimer = window.setInterval(function () {                  
                                                                            VUMeter.visualize(refVoiceUIControl.winControl._getCurrentVolumnLevel());
                                                                       },   this._VolumnLevelSampleRate);

                // Activate control buttons
                this._refDivControlActionsGo.className = "win-gobutton visible";
                this._refDivControlActionsGo.tabIndex = 1;
                this._refDivControlActionsGo.hideFocus = true;
                this._refDivControlActionsGo.focus();
                this._refDivControlActionsCancel.className = "win-cancelbutton hidden";               

            },
            
            /// <summary>
            /// Transition VoiceUIControl to "Thinking" Mode.
            /// </summary>
            /// <param name=""></param>
            /// <returns></returns>
            _transitionToThinking: function () {

                // Play earcon audio to indicate that processor has started thinking over user's voice input.
                AudioPlayer.play("Bing.Speech/earcons/" + Earcons.StartThinking);

                // Setup visualization for the Thinking state
                clearInterval(this._dispatcherTimer);                
                TextArea.clear(); 
                VUMeter._clearCanvas();
                TextScramble.startScramble()

                // Activate control buttons
                this._refDivControlActionsGo.className = "win-gobutton hidden";
                this._refDivControlActionsCancel.className = "win-cancelbutton visible";
                this._refDivControlActionsCancel.tabIndex = 1;                
                this._refDivControlActionsCancel.hideFocus = true;
                this._refDivControlActionsCancel.focus();               

            },
            
            /// <summary>
            /// Transition VoiceUIControl to "Completed" Mode.
            /// </summary>
            /// <param name=""></param>
            /// <returns></returns>
            _transitionToComplete: function () {

                // Setup visualization for the Completed state
                clearInterval(this._dispatcherTimer);     
                TextArea.clear();
                TextScramble.stopScramble();
                VUMeter._clearCanvas();

                // Detach VoiceUIControl from NL Processor
                this._deactivate();

            },
                        
            /// <summary>
            /// On Click of "GO" button
            /// </summary>
            /// <param name=""></param>
            /// <returns></returns>
            _goButtonClick: function () {

                this._speechRecognizer.stopListeningAndProcessAudio();             

            },
                        
            /// <summary>
            /// On Click of "CANCEL" button
            /// </summary>
            /// <param name=""></param>
            /// <returns></returns>
            _cancelButtonClick: function () {
                
                if (this._speechRecognizer) {
                    this._speechRecognizer.requestCancelOperation();
                }
                
                this._deactivate();

            }, 
                        
            /// <summary>
            /// Executed when the HTML DIV of VoiceUIControl loses focus.
            /// This function will attest if the current focused is on one of the child elements of VoiceUIControl, otherwise VoiceUIControl will be dismissed and NL Processor will be detached.
            /// </summary>
            /// <param name=""></param>
            /// <returns></returns>
            _onBlurProcessing: function () {

                /*#DBG
                _TRACE("Active element is: " + document.activeElement.id);
                #DBG*/

                var currActiveElementID = document.activeElement.id;                
                if (currActiveElementID == this._refDivVoiceUIControl.id
                    || currActiveElementID == this._refDivVoiceUIControlBar.id
                    || currActiveElementID == this._refDivTextArea.id
                    || currActiveElementID == this._refDivVUMeter.id
                    || currActiveElementID == this._refDivScrambleText.id
                    || currActiveElementID == this._refDivGarbageText.id
                    || currActiveElementID == this._refDivGradientText.id
                    || currActiveElementID == this._refDivControlActionsGo.id
                    || currActiveElementID == this._refDivControlActionsCancel.id
                   ) {
                    /*#DBG
                    _TRACE("Click was still on VoiceUIControl");
                    #DBG*/
                }
                else {
                    this._refDivVoiceUIControl.winControl._cancelButtonClick();
                }

            },
            //#endregion
        }
        //#endregion
        );

    // Publish Class for Voice UI Control
    WinJS.Namespace.define("BingWinJS", {
        SpeechRecognizerUx: controlClass
    }
                          );
}
)();

/// <summary>
/// Class: TextArea
/// This will be a sub-element of VoiceUiControl. Used for providing textual feedback/visualization during different states of VoiceUiControl
/// </summary>
var TextArea = new function () {

    //#region Private Members
    this._textArea;						                // Reference to DIV on VoiceUIControl that will host the TextArea inside it.	
    this._tips;                                         // Tips to be displayed as hints for user.
    this._tipIndex = 0;                                 // Iterator to pick random tip at runtime from _tips[]
    this._normalTipBrush = "#808080";                   // Font-Color for normal text of hint
    this._highlightTipBrush = "#00B4FF";                // Font-color for text/phrases of hint that should be highlighted - Modern Blue

    //#region Public Methods
    /// <summary>
    /// Constructor: Initialize TextArea sub-element
    /// </summary>
    /// <param name="_refDivTextArea">reference to HTML DIV that will host TextArea feedback/visualization</param>
    /// <returns></returns>   
    this.initialize = function (_refDivTextArea, tips) {

        this._textArea = _refDivTextArea;      
        this._tips = tips;        
        this._textArea.className = "voice-ui-control-visual-element-tiptext";
        this.clear();

    };

    /// <summary>
    /// Destructor: clears reference to host HTML DIV element
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.destroy = function () {
        this._textArea = "";
        this._tips = "";
    };

    /// <summary>
    /// Clears TextArea
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.clear = function () {

        if (this._textArea) {
            while (this._textArea.hasChildNodes()) {
                this._textArea.removeChild(this._textArea.lastChild);
            }
        }

    };

    /// <summary>
    /// Set Tip from _tips[] onto the TextArea on load of a control during listening state.
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.setTip = function () {
        
        if (this._tips && (this._tips.length > 0)) {
            this._textArea.innerHTML = this._overflowWrap(this._getTip(), DataOverflowWrapPosition.end);
        }

    };

    /// <summary>
    /// Set passed argument text onto the TextArea
    /// </summary>
    /// <param name="text>Text to be displayed on TextArea</param>
    /// <returns></returns>
    this.setText = function (text) {

        this._textArea.innerHTML = this._overflowWrap(text, DataOverflowWrapPosition.start);

    };

    //#endregion

    //#region Private Methods
    /// <summary>
    /// Get a tip value from the array _tip[]
    /// </summary>
    /// <param name=""></param>
    /// <returns>string value from the array _tip[]</returns>
    this._getTip = function () {

        return this._tips[this._tipIndex++ % this._tips.length];

    };

    /// <summary>
    /// Format input string with by highlighting key tokens with highlighter.
    /// </summary>
    /// <param name="unformattedTip">Unformatted input string</param>
    /// <returns>formatted string</returns>
    this._formatTip = function (unformattedTip) {

        while (unformattedTip.indexOf('#') >= 0) {
            unformattedTip = unformattedTip.replace('#', '<span class="color-highlight">').replace('#', '</span>');
        }
        return unformattedTip;

    };

    /// <summary>
    /// Formats Current text
    /// It will prune the text from the start end based on dataOverflowWrapPosition provided to make sure that it occuies at the most 2 lines on TextArea display. 
    /// Pruned text will be prefixed or suffixed with ellipses (...) for wrap at start or wrap at end respectively.
    /// </summary>   
    /// <param name="text">original text string</param>
    /// <param name="dataOverflowWrapPosition">position for data wrapping(...); start/end</param>
    /// <returns>var: text With Overflow Wrap</returns>
    this._overflowWrap = function (text, dataOverflowWrapPosition) {

        // Create clone of TextArea filled with current hypothesis from NL Processor
        var refDivTextAreaClone = document.createElement("div");
        refDivTextAreaClone.id = "divVoiceUIControlVisualElementTextAreaClone_" + GUID.generate();        
        text = window.toStaticHTML(text);        
        refDivTextAreaClone.innerHTML = text;
        refDivTextAreaClone.className = "voice-ui-control-visual-element-tiptext hidden";
        var varRefDivVoiceUIControl = "";
        if (this._textArea) {
            varRefDivVoiceUIControl = this._textArea.parentNode.parentNode;
        }
        if (varRefDivVoiceUIControl == "") {
            document.body.appendChild(refDivTextAreaClone);
        }
        else {
            varRefDivVoiceUIControl.appendChild(refDivTextAreaClone);
        }

        // There is no possible text oveflow in TextArea
        if (refDivTextAreaClone.offsetHeight >= refDivTextAreaClone.scrollHeight) {
            refDivTextAreaClone.innerHTML += "<br>";
            // Single line text
            if (refDivTextAreaClone.offsetHeight >= refDivTextAreaClone.scrollHeight) {
                // Move text to lower line
                refDivTextAreaClone.innerHTML = "<br>" + text;
            }
                // Double line text
            else {
                refDivTextAreaClone.innerHTML = text;
            }
        }
            // There is going to be text oveflow in TextArea
        else {
            var intermediateFormattedTextLength = 0;
            if (dataOverflowWrapPosition == DataOverflowWrapPosition.start) {
                // Put ellipsis at start
                // Prune words from the start end to fit the text area.
                do {
                    refDivTextAreaClone.innerHTML = refDivTextAreaClone.innerHTML.substr(refDivTextAreaClone.innerHTML.indexOf(" ") + 1);
                } while (refDivTextAreaClone.offsetHeight < refDivTextAreaClone.scrollHeight);
                intermediateFormattedTextLength = refDivTextAreaClone.innerHTML.length;
                // Prune additional words to make place for ellipses (...)
                do {
                    refDivTextAreaClone.innerHTML = refDivTextAreaClone.innerHTML.substr(refDivTextAreaClone.innerHTML.indexOf(" ") + 1);
                } while (intermediateFormattedTextLength - refDivTextAreaClone.innerHTML.length < 3);
                refDivTextAreaClone.innerHTML = "..." + refDivTextAreaClone.innerHTML;
            }
            else {
                // Put ellipsis at end
                do {
                    refDivTextAreaClone.innerHTML = refDivTextAreaClone.innerHTML.substr(0, refDivTextAreaClone.innerHTML.lastIndexOf(" "));
                } while (refDivTextAreaClone.offsetHeight < refDivTextAreaClone.scrollHeight);
                intermediateFormattedTextLength = refDivTextAreaClone.innerHTML.length;
                // Prune additional words to make place for ellipses (...)
                do {
                    refDivTextAreaClone.innerHTML = refDivTextAreaClone.innerHTML.substr(0, refDivTextAreaClone.innerHTML.lastIndexOf(" "));
                } while (intermediateFormattedTextLength - refDivTextAreaClone.innerHTML.length < 3);
                refDivTextAreaClone.innerHTML = refDivTextAreaClone.innerHTML + "...";
            }
        }
        // destroy clone of TextArea
        var textWithOverflowWrapAtTop = refDivTextAreaClone.innerHTML;

        if (varRefDivVoiceUIControl == "") {
            document.body.removeChild(refDivTextAreaClone);
        }
        else {
            varRefDivVoiceUIControl.removeChild(refDivTextAreaClone)
        }

        return textWithOverflowWrapAtTop;

    };
    //#endregion
};

/// <summary>
/// Class: TextScramble
/// This will be a sub-element of VoiceUiControl. Used for providing visualization during "Thinking" state of VoiceUiControl
/// </summary>
var TextScramble = new function () {

    //#region Constants
    this.ALPHABET = "abcdefghijklmnopqrstuvwxyz";               // Alphabet of non-space characters to use in scramble
    this.SPACE_CHARACTER = ' ';                                 // The character used for word-breaking within each string
    //#endregion

    //#region Private Members
    this._targetStringLength = 15;                              // Desired length of the scramble and garbage strings
    this._characterMutationRate = 0.1;                          // Rate at which scramble string characters are mutated during each tick
    this._scrambleStringSpaceRate = 0.05;                       // Rate at which spaces appear in the scramble string
    this._garbageStringSpaceRate = 0.5;                         // Rate at which spaces appear in the garbage string    
    this._scrambleRefreshRate = 100;                            // Delay in ms between each scramble tick    
    this._scrambleString;                                       // Scramble string, randomly mutated on each tick
    this._garbageString;                                        // Garbage string, generated from scratch on each tick
    this._dispatcherTimer;                                      // Will be used to hold Timer handle for synchronization purposes.

    this._refDivScrambleText;                                   // Reference to HTML element on the screen for Scrambled Text
    this._refDivGarbageText;                                    // Reference to HTML element on the screen for Garbage Text
    this._refDivGradientText;                                   // Reference to HTML element on the screen for Gradient Text
    //#endregion

    //#region Public Methods
    /// <summary>
    /// Constructor
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.initialize = function (_refDivScrambleText, _refDivGarbageText, _refDivGradientText) {

        // Configure UI elements
        this._refDivScrambleText = _refDivScrambleText;
        this._refDivGarbageText = _refDivGarbageText;
        this._refDivGradientText = _refDivGradientText;
        this._refDivScrambleText.className = "voice-ui-control-visual-element-scramble-text";
        this._refDivGarbageText.className = "voice-ui-control-visual-element-garbage-text";
        this._refDivGradientText.className = "voice-ui-control-visual-element-gradient-text";
        this._clear();
        // Configure internal states        
        this._generateScrambleString();

    };

    /// <summary>
    /// Destructor: clears reference to host HTML DIV element
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.destroy = function () {
        this._refDivScrambleText = "";
        this._refDivGarbageText = "";
        this._refDivGradientText = "";
    };

    /// <summary>
    /// Begins the TextScramble's internal timer 
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.startScramble = function () {

        this._clear();
        clearInterval(this._dispatcherTimer);
        this._dispatcherTimer = window.setInterval("TextScramble._tick()", this._scrambleRefreshRate);

    };

    /// <summary>
    /// Halts the TextScramble's internal timer
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.stopScramble = function () {

        clearInterval(this._dispatcherTimer);
        this._clear();

    };
    //#endregion

    //#region Private Methods    
    /// <summary>
    /// Clears the current scramble display.
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this._clear = function () {

        // Reset UI Text tips
        if (this._refDivScrambleText)
            this._refDivScrambleText.innerHTML = "";
        if (this._refDivGarbageText)
            this._refDivGarbageText.innerHTML = "";
        if (this._refDivGradientText)
            this._refDivGradientText.innerHTML = "";

    };

    /// <summary>
    /// Called for each refresh of the scramble and garbage strings
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this._tick = function () {

        // generate scrambled strings
        this._mutateScrambleString();
        this._generateGarbageString();

        // update UI Text tips
        this._refDivScrambleText.innerHTML = this._scrambleString;
        this._refDivGarbageText.innerHTML = this._garbageString;
        this._refDivGradientText.innerHTML = this._scrambleString.substr(0, 2);

    };

    /// <summary>
    /// Generates a new garbage string from scratch and sets it
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this._generateGarbageString = function () {

        var newString = "";
        for (var itr = 0; itr < this._targetStringLength; itr++) {
            newString += this._getRandomChar(1, this._garbageStringSpaceRate);
        }
        this._garbageString = newString;

    };

    /// <summary>
    /// Generates a new scramble string from scratch and sets it
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this._generateScrambleString = function () {

        this._scrambleString = "";
        for (var itr = 0; itr < this._targetStringLength; itr++) {
            this._scrambleString += this._getRandomChar(1, this._scrambleStringSpaceRate);
        }

    };

    /// <summary>
    /// Returns a random character from the TextScramble's alphabet.    
    /// </summary>
    /// <param name="allowSpaces">If true, allows the function to return the space character</param>
    /// <param name="spaceRate">Rate between 0 and 1 at which spaces should be used</param> 
    /// <returns></returns>
    this._getRandomChar = function (allowSpaces, spaceRate) {

        if (allowSpaces && (parseFloat(Math.random()) < parseFloat(spaceRate))) {
            return this.SPACE_CHARACTER;
        }
        return this.ALPHABET[Math.floor(Math.random() * 26 + 1) - 1];

    };

    /// <summary>
    /// Returns a mutation of the input character.
    /// 50% of the time the mutation is the next character in the alphabet.
    /// 50% of the time the mutation is the previous character in the alphabet. 
    /// </summary>
    /// <param name="inputChar">character that will be mutated for next iteration</param>
    /// <returns></returns>
    this._mutateChar = function (inputChar) {

        var oldIndex = this.ALPHABET.indexOf(inputChar);
        var newIndex = oldIndex + (Math.round(Math.random()) * 2 - 1)     // Either adds or subtracts 1
        newIndex = Math.min(this.ALPHABET.length - 1, Math.max(0, newIndex));
        return this.ALPHABET[newIndex];

    };

    /// <summary>
    /// Builds a new scramble string character by character:
    /// - If the char is a space, it has a chance to become a random non-space char
    /// - If the char isn't a space or adjacent to one, it has a chance to become a space
    /// - If the char isn't a space and doesn't become one, it has a chance to mutate 
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this._mutateScrambleString = function () {

        var newScramble = "";
        var thisChar;
        var previousChar;
        var nextChar;

        for (var itr = 0; itr < this._targetStringLength; itr++) {
            thisChar = this._scrambleString[itr];
            previousChar = (itr == 0) ? this._scrambleString[this._targetStringLength - 1] : this._scrambleString[itr - 1];
            nextChar = (itr == this._targetStringLength - 1) ? this._scrambleString[0] : this._scrambleString[itr + 1];

            if ((thisChar == this.SPACE_CHARACTER) && (Math.random() < this._scrambleStringSpaceRate)) {
                newScramble += this._getRandomChar(0, 0);
            }
            else if ((thisChar != this.SPACE_CHARACTER) && (previousChar != this.SPACE_CHARACTER) && (nextChar != this.SPACE_CHARACTER) && (Math.random() < this._scrambleStringSpaceRate)) {
                newScramble += this.SPACE_CHARACTER;
            }
            else if ((thisChar != this.SPACE_CHARACTER) && (Math.random() < this._characterMutationRate)) {
                newScramble += this._mutateChar(thisChar);
            }
            else {
                newScramble += thisChar;
            }
        }

        this._scrambleString = newScramble.toString();

    };
    //#endregion
};

/// <summary>
/// Class: VUMeter
/// This will be a sub-element of VoiceUiControl. Used for audio input visualization during "Listening" state of VoiceUiControl
/// </summary>
var VUMeter = new function () {

    //#region Constants
    this.CELL_SIZE_NORMAL_RESOLUTION = 4;		        // Normal Resolution cell length / width
    this.CELL_SIZE_HIGH_RESOLUTION = 6; 		        // HIGH Resolution cell length / width
    this.CELL_SIZE_VERY_HIGH_RESOLUTION = 8;            // VERY HIGH Resolution cell length / width
    //#endregion

    //#region Private Members
    this._refDivVUMeter;					            // Reference to DIV on VoiceUIControl that will host the VUMeter inside it.	
    this._vuMeterCanvas;                                // Reference to canvas on VUMeter control that will be used for visualization.
    this._cellSize = 4;							        // Desired cell size for LEDs to be drawn on canvas during visualization.
    this._numberOfColumns = 34;					        // Max Column count to display, regardless of volume.
    this._numberOfRows = 11;					        // Maximum row count to display
    this._actualColumnCount = this._numberOfColumns;    // Based on resolution and orientation of APP, you can set this value.
    this._silenceVolumeLevel = 0.01;                    // Noise floor for silence - original: 0.03
    this._peakLevel = 1.3;                              // Noise ceiling for "peaking" the meter - original: 0.5
    this._waveformShapeCoefficients = [
            0.630, 0.485, 0.522, 0.505, 0.501, 0.566, 0.502, 0.603, 0.629, 0.779,
            0.811, 0.866, 1.000, 0.819, 0.779, 0.875, 0.561, 0.622, 0.720, 0.816,
            0.806, 0.907, 0.688, 0.694, 0.618, 0.694, 0.787, 0.666, 0.743, 0.819,
            0.772, 0.771, 0.871, 0.755, 0.751, 0.651, 0.498, 0.607, 0.352, 0.647,
            0.536, 0.573, 0.433, 0.374, 0.320, 0.283, 0.301, 0.307, 0.289, 0.190,
            0.135, 0.192, 0.119, 0.121, 0.140, 0.180, 0.231, 0.214, 0.137, 0.085
    ];                                                  // Waveform shape array, to be scaled by volume
    //#endregion

    //#region Public Methods
    /// <summary>
    /// Constructor: Initialize VUMeter sub-element
    /// </summary>
    /// <param name="_refDivVUMeter">reference to HTML DIV that will host VUMeter visualization</param>
    /// <returns></returns>    
    this.initialize = function (_refDivVUMeter) {

        this._refDivVUMeter = _refDivVUMeter;
        this.clear();
        this._refDivVUMeter.className = "voice-ui-control-visual-element-vumeter";
        //this._calculateCellSize();
        // Base canvas to draw visualizations
        // *2 because there is an illusion of a blank row in between two actual rows.
        // -1 because if there are actual 10 rows then there are 9 rows that happen to be in between the 10 rows.	    
        var vuMeterHeight = (((this._numberOfRows * 2) - 1) * this._cellSize);
        var vuMeterCanvas = document.createElement('canvas');
        vuMeterCanvas.id = "vuMeterCanvas";
        vuMeterCanvas.style.styleFloat = "left";
        vuMeterCanvas.height = vuMeterHeight;
        this._refDivVUMeter.appendChild(vuMeterCanvas);
        this._vuMeterCanvas = vuMeterCanvas;
        this.setSize();

    };

    /// <summary>
    /// Destructor: clears reference to host HTML DIV element
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.destroy = function () {
        this._refDivVUMeter = "";
    };

    /// <summary>
    /// set number of columns to display in VUMeter
    /// </summary>
    /// <param name="numberOfColumnsToRender">Number of columns to be rendered in the VUMeter</param>
    /// <returns></returns>
    this.setSize = function (numberOfColumnsToRender) {

        this._actualColumnCount = typeof numberOfColumnsToRender !== 'undefined' ? numberOfColumnsToRender : this._numberOfColumns;
        this._clearCanvas();
        /*#DBG
	    _TRACE("Log: drawing VUMeter... with columns: " + this._actualColumnCount);
        #DBG*/

    };

    /// <summary>
    /// Called every "_VolumnLevelSampleRate" seconds to update the VU meter with the current volume. Sample rate is defined in VoiceUiControl class
    /// </summary>
    /// <param name="volumeLevel">Audio input volumn level to be visualized</param>
    /// <returns></returns>
    this.visualize = function (volumeLevel) {

        /*#DBG
	    _TRACE("VUMeter got volume level as: " + volumeLevel);
        #DBG*/

        try {
            this._updateVUMeter(volumeLevel);
        }
        catch (err) {
            this._clearCanvas();
            /*#DBG
	        _TRACE("Error: " + err.message + ".");
            #DBG*/
            // throw err;            
            // NOP: Suppressing Error that might occur due to queued VUMeter update and VUmeter clearing when snap view or orientation changes happening in parallel.
        }

    };

    /// <summary>
    /// Clear VUMeter
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this.clear = function () {

        if (this._refDivVUMeter) {
            while (this._refDivVUMeter.hasChildNodes()) {
                this._refDivVUMeter.removeChild(this._refDivVUMeter.lastChild);
            }
        }
        this._vuMeterCanvas = "";
        /*#DBG
	    _TRACE("Log: clearing VUMeter...");
        #DBG*/

    };
    //#endregion

    //#region Private Methods
    /// <summary>
    /// Determine desired cell length & width based on app resolution
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>	
    this._calculateCellSize = function () {

        /*#DBG
	    _TRACE("Log: Your display scale: " + Windows.Graphics.Display.DisplayProperties.resolutionScale);
        #DBG*/
        switch (Windows.Graphics.Display.DisplayProperties.resolutionScale) {
            case 100:													// Scale 100%
                this._cellSize = this.CELL_SIZE_NORMAL_RESOLUTION;
                break;
            case 140:													// Scale 140%
                this._cellSize = this.CELL_SIZE_HIGH_RESOLUTION;
                break;
            case 180:													// Scale 180%
                this._cellSize = this.CELL_SIZE_VERY_HIGH_RESOLUTION;
                break;
            default:
                this._cellSize = this.CELL_SIZE_NORMAL_RESOLUTION;
                break;
        }

    };

    /// <summary>
    /// Updates VUMeter masking based on volume level, using random adjustments
    /// </summary>
    /// <param name="volumeLevel">updated volumnlevel to be used for redrawing/updating VUMeters</param>
    /// <returns></returns>
    this._updateVUMeter = function (volumeLevel) {

        var cellsToBeShown = 0;                         //  number of cells to show for column under iteration below
        var shapeIndex = 0;
        var curShape = 0.0;
        var randomNumber = 0;
        var noise = 0;
        var cellsToHide = 0;
        var rowItr = 0;

        // Get context of a canvas
        var ctx = this._vuMeterCanvas.getContext("2d");

        // clear the canvas white board
        this._clearCanvas();

        // iterate through each column and toggle visibility as necessary
        for (var col = 0; col < this._actualColumnCount; col++) {
            if (volumeLevel < this._silenceVolumeLevel) {

                // for silence, show at least one and up to two rows
                cellsToBeShown = Math.floor(Math.random() * 10 + 1) % 2;

            }
            else {

                // map the column's index to a fixed coefficient
                shapeIndex = parseInt((col * 3) / 2);
                if (shapeIndex < 0) {
                    shapeIndex = 0;
                }
                else if (shapeIndex >= this._waveformShapeCoefficients.length) {
                    shapeIndex = this._waveformShapeCoefficients.length - 1;
                }
                curShape = this._waveformShapeCoefficients[shapeIndex];
                cellsToBeShown = parseInt((curShape * volumeLevel) / (this._peakLevel));     // Always show atleast 1 cell

                randomNumber = Math.floor((Math.random() * 10) + 1);
                noise = (randomNumber >> 2) & 3;                                                    // add or subtract a bar to keep it lively

                if (noise > 0) {
                    cellsToBeShown = cellsToBeShown + noise - 2;                                    // 1, 2, 3 => -1, 0, 1
                }
                cellsToBeShown = Math.max(1, Math.min(cellsToBeShown, (this._numberOfRows)));

            }

            // Since we draw from the top
            cellsToHide = this._numberOfRows - cellsToBeShown;

            for (var row = 0; row < this._numberOfRows; row++) {
                ctx.beginPath();
                ctx.rect(col * this._cellSize * 2, 0 + row * this._cellSize * 2, this._cellSize, this._cellSize);
                if (row < cellsToHide) {
                    // Skip color fill for cells to be hidden
                }
                else if (row > 2) {
                    ctx.fillStyle = "WHITE";
                    ctx.fill();
                }
                else {
                    ctx.fillStyle = "#00B4FF";
                    ctx.fill();
                }
            }
        }
    };

    /// <summary>
    /// Clears VUMeter canvas and get it ready for next redraw/update
    /// </summary>
    /// <param name=""></param>
    /// <returns></returns>
    this._clearCanvas = function () {

        if (this._vuMeterCanvas != "") {
            var ctx = this._vuMeterCanvas.getContext("2d");
            ctx.clearRect(0, 0, this._vuMeterCanvas.width, this._vuMeterCanvas.height);      // clear the canvas white board
        }

    };
    //#endregion    

};

/*#DBG
var _ASSERT = function (condition) { 
    if (!condition) { 
        throw "ASSERT FAILED"; 
    } 
};
var _TRACE = function (text) { 
    if (window.console && console.log) {
        console.log(text);
    }
};
#DBG*/