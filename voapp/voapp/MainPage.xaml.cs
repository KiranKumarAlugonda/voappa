using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using System.Threading;
using System.Threading.Tasks;
using Bing.Speech;
using Auth0.SDK;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

//namespace voapp
//{
//    /// <summary>
//    /// An empty page that can be used on its own or navigated to within a Frame.
//    /// </summary>
//    public sealed partial class MainPage : Page
//    {
//        public MainPage()
//        {
//            this.InitializeComponent();
//        }
//        public MainPage()
//        {
//            this.InitializeComponent();
//            this.Loaded += MainPage_Loaded;
//        }

//        SpeechRecognizer SR;
//        private void MainPage_Loaded(object sender, RoutedEventArgs e)
//        {
//            // Apply credentials from the Windows Azure Data Marketplace.
//            var credentials = new SpeechAuthorizationParameters();
//            credentials.ClientId = "<YOUR CLIENT ID>";
//            credentials.ClientSecret = "<YOUR CLIENT SECRET>";

//            // Initialize the speech recognizer and attach to control.
//            SR = new SpeechRecognizer("en-US", credentials);
//            SpeechControl.SpeechRecognizer = SR;
//        }

//        private async void SpeakButton_Click(object sender, RoutedEventArgs e)
//        {
//            try
//            {
//                // Start speech recognition.
//                var result = await SR.RecognizeSpeechToTextAsync();
//                ResultText.Text = result.Text;
//            }
//            catch (System.Exception ex)
//            {
//                ResultText.Text = ex.Message;
//            }
//        }
//    }
//}

namespace voapp
{
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
            this.Loaded += MainPage_Loaded;
        }

        SpeechRecognizer SR;
        private void MainPage_Loaded(object sender, RoutedEventArgs e)
        {
            //Login();

            // Apply credentials from the Windows Azure Data Marketplace.
            var credentials = new SpeechAuthorizationParameters();
            //credentials.ClientId = "sfBNUQUSidqrlTxSeQphLjZ2SJ8J49VI";
            //credentials.ClientSecret = "F0NdHYIZFRrxiXdqxRptxl_W7nesvEJg2_uLtd3yiaRQz1x71Jwqwb0kKFD3Dhkr";

            credentials.ClientId = "VoiceApp_POC";
            credentials.ClientSecret = "/CUK7HlQQVGI+eSQTaZzvXHk+pp0N1KBZYzizACpPvE=";
            
            // Initialize the speech recognizer.
            SR = new SpeechRecognizer("en-US", credentials);

            // Add speech recognition event handlers.
            SR.AudioCaptureStateChanged += SR_AudioCaptureStateChanged;
            SR.AudioLevelChanged += SR_AudioLevelChanged;
            SR.RecognizerResultReceived += SR_RecognizerResultReceived;
        }

        void SR_RecognizerResultReceived(SpeechRecognizer sender,
            SpeechRecognitionResultReceivedEventArgs args)
        {
            IntermediateResults.Text = args.Text;
        }

        void SR_AudioLevelChanged(SpeechRecognizer sender,
            SpeechRecognitionAudioLevelChangedEventArgs args)
        {
            var v = args.AudioLevel;
            if (v > 0) VolumeMeter.Opacity = v / 50;
            else VolumeMeter.Opacity = Math.Abs((v - 50) / 100);
        }

        void SR_AudioCaptureStateChanged(SpeechRecognizer sender,
            SpeechRecognitionAudioCaptureStateChangedEventArgs args)
        {
            // Show the panel that corresponds to the current state.
            switch (args.State)
            {
                case SpeechRecognizerAudioCaptureState.Complete:
                    if (uiState == "ListenPanel" || uiState == "ThinkPanel")
                    {
                        SetPanel(CompletePanel);
                    }
                    break;
                case SpeechRecognizerAudioCaptureState.Initializing:
                    SetPanel(InitPanel);
                    break;
                case SpeechRecognizerAudioCaptureState.Listening:
                    SetPanel(ListenPanel);
                    break;
                case SpeechRecognizerAudioCaptureState.Thinking:
                    SetPanel(ThinkPanel);
                    break;
                default:
                    break;
            }
        }

        private async void Login()
        {
            var auth0 = new Auth0Client(
                    "majji.auth0.com",
                    "sfBNUQUSidqrlTxSeQphLjZ2SJ8J49VI");

            var user = await auth0.LoginAsync();
        }

       
        string uiState = "";
        private void SetPanel(StackPanel panel)
        {
            // Hide all the panels.
            InitPanel.Visibility = Visibility.Collapsed;
            ListenPanel.Visibility = Visibility.Collapsed;
            ThinkPanel.Visibility = Visibility.Collapsed;
            CompletePanel.Visibility = Visibility.Collapsed;
            StartPanel.Visibility = Visibility.Collapsed;

            // Show the selected panel and the cancel button.
            panel.Visibility = Visibility.Visible;
            CancelButton.Visibility = Visibility.Visible;

            uiState = panel.Name;
        }


        private async void SpeakButton_Click(object sender, RoutedEventArgs e)
        {
            // Always use a try block because RecognizeSpeechToTextAsync
            // depends on a web service.
            try
            {
                
                
                /* 
                    Use this object to do wonderful things, e.g.:
                      - get user email => user.Profile["email"].ToString()
                      - get facebook/google/twitter/etc access token => user.Profile["identities"][0]["access_token"]
                      - get Windows Azure AD groups => user.Profile["groups"]
                      - etc.
                */

                // Start speech recognition.
                var result = await SR.RecognizeSpeechToTextAsync();

                // Display the text.
                FinalResult.Text = result.Text;

                // Show the TextConfidence.
                ShowConfidence(result.TextConfidence);

                // Fill a string array with the alternate results.
                var alternates = result.GetAlternates(5);
                if (alternates.Count > 1)
                {
                    string[] s = new string[alternates.Count];
                    for (int i = 1; i < alternates.Count; i++)
                    {
                        s[i] = alternates[i].Text;
                    }

                    // Populate the alternates ListBox with the array.
                    AlternatesListBox.ItemsSource = s;
                    AlternatesTitle.Visibility = Visibility.Visible;
                }
                else
                {
                    AlternatesTitle.Visibility = Visibility.Collapsed;
                }

                //AlternatesListBox.ItemsSource = result.GetAlternates(5);
            }
            catch (Exception ex)
            {
                // If there's an exception, show it in the Complete panel.
                if (ex.GetType() != typeof(OperationCanceledException))
                {
                    FinalResult.Text = string.Format("{0}: {1}",
                                ex.GetType().ToString(), ex.Message);
                    SetPanel(CompletePanel);
                }
            }
        }

        private void ShowConfidence(SpeechRecognitionConfidence confidence)
        {
            switch (confidence)
            {
                case SpeechRecognitionConfidence.High:
                    ConfidenceText.Text = "I am almost sure you said:";
                    break;
                case SpeechRecognitionConfidence.Medium:
                    ConfidenceText.Text = "I think you said:";
                    break;
                case SpeechRecognitionConfidence.Low:
                    ConfidenceText.Text = "I think you might have said:";
                    break;
                case SpeechRecognitionConfidence.Rejected:
                    ConfidenceText.Text = "I'm sorry, I couldn't understand you."
                    + " Please click the Cancel button and try again.";
                    break;
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            // Cancel the current speech session and return to start.
            SR.RequestCancelOperation();
            SetPanel(StartPanel);
            CancelButton.Visibility = Visibility.Collapsed;
        }

        private void StopButton_Click(object sender, RoutedEventArgs e)
        {
            // Stop listening and move to Thinking state.
            SR.StopListeningAndProcessAudio();
        }

        private void AlternatesListBox_SelectionChanged(object sender,
            SelectionChangedEventArgs e)
        {
            // Check in case the ListBox is still empty.
            if (null != AlternatesListBox.SelectedItem)
            {
                // Put the selected text in FinalResult and clear ConfidenceText.
                FinalResult.Text = AlternatesListBox.SelectedItem.ToString();
                ConfidenceText.Text = "";
            }
        }
    }
}