import React, { Component } from 'react';
import { View,
   Text, 
   StyleSheet, 
   Image, 
   Modal, 
   TouchableOpacity, 
   ToastAndroid, 
   PermissionsAndroid, 
   Platform, 
   ScrollView,
   Dimensions,
   Button,
   TouchableHighlight
   } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';

const { width } = Dimensions.get('window')

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <Text>Waiting</Text>
  </View>
)

class cameraComponent extends Component<Props> {

    constructor(props: Props) {
        super(props);
        this.state = {capture:'photo'}; // default to photo
        this.state={ flashon:RNCamera.Constants.FlashMode.off };
        this.state = {
            // cameraType : 'back',
            // mirrorMode : false,
            backCamera: true,
            videoData: null,
            recording: false,
            data: null,
            seconds: 0,
            maxDuration: 300, // seconds
            captureAudio: true, 
            modalVisible: false, 
            photos: [],
            videos: [],
            index: null
          }
    }

  //   state = {
  //     modalVisible: false,
  //     photos: [],
  //     index: null
  // }

    
    toggleTorch=()=>
    {
      let tstate = this.state.flashon;
      if (tstate == RNCamera.Constants.FlashMode.off){
         tstate = RNCamera.Constants.FlashMode.on;
      } else {
        tstate = RNCamera.Constants.FlashMode.off;
      }
      this.setState({flashon:tstate})
   }

   checkAndroidPermission = async () => {
    try {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      await PermissionsAndroid.request(permission);
      Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
};

    takePicture = async () => {
        if (this.camera) {
          if (Platform.OS === 'android') {
            await this.checkAndroidPermission();
          }
            const options = { quality: 1 };
            const data = await this.camera.takePictureAsync(options);
            //save photo
            CameraRoll.save(data.uri, {type: 'photo', album: 'Vocajam Photos'}).then(onfulfilled => {
                ToastAndroid.show(`Vocajam Photos: ${onfulfilled}`, ToastAndroid.SHORT);
            }).catch(error => {
                ToastAndroid.show(`${error.message}`, ToastAndroid.SHORT);
            });
        }
    };


    recordVideo = async () => {
      if (this.camera) {
          if (!this.state.recording)
              this.startRecording();
          else this.stopRecording();
      }
  }

  startRecording = async () => {
    this.setState({ recording: true });
    this.countRecordTime = setInterval(() => this.setState({ seconds: this.state.seconds + 1 }), 1000);
    const cameraConfig = { maxDuration: this.state.maxDuration };
    const data = await this.camera.recordAsync(cameraConfig);
    this.setState({ recording: false });
    CameraRoll.save(data.uri, {type: 'video', album: 'Vocajam Videos'}).then(onfulfilled => {
        ToastAndroid.show(`Vocajam Videos: ${onfulfilled}`, ToastAndroid.SHORT)
    }).catch(error => ToastAndroid.show(`${error.message}`, ToastAndroid.SHORT));
}

stopRecording = () => {
    this.camera.stopRecording();
    clearInterval(this.countRecordTime);
    this.setState({ seconds: 0 });
}

    reverseCamera = () => {
      if (this.state.recording) {
        clearInterval(this.countRecordTime);
        this.setState({ seconds: 0 });
      }

      let backCamera = !this.state.backCamera;
      if (backCamera)
        ToastAndroid.show('reverse to back camera', ToastAndroid.SHORT);
      else ToastAndroid.show('reverse to front camera', ToastAndroid.SHORT);
      this.setState({ backCamera });  
    }

      secondsToMMSS = (seconds: number) => {
        let m = Math.floor(seconds / 60);
        let s = Math.floor(seconds % 60);
    
        let mDisplay = m < 10 ? `0${m}` : `${m}`;
        let sDisplay = s < 10 ? `0${s}` : `${s}`;
        return `${mDisplay}:${sDisplay}`; 
    }

    navigatePhotoGallery = () => {
      navigation = useNavigation();
    }

    setIndex = (index) => {
      if (index === this.state.index) {
          index = null
      }
      this.setState({ index })
  }

  getPhotos = () => {
      CameraRoll.getPhotos({
          first: 20,
          groupTypes: 'Album',
          groupName: 'Vocajam Photos',
          assetType: 'Photos'
      })
      .then(r => this.setState({ photos: r.edges}))
  }



  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible})
}


  share = () => {
      const image = this.state.photos[this.state.index].node.image.uri
      RNFetchBlob.fs.readFile(image, 'base64')
      .then((data) => {
        let shareOptions = {
          title: "React Native Share Example",
          message: "Check out this photo!",
          url: `data:image/jpg;base64,${data}`,
          subject: "Check out this photo!"
        };
  
        Share.open(shareOptions)
          .then((res) => console.log('res:', res))
          .catch(err => console.log('err', err))
      })
    }

  render() {
    return (
      <View style={styles.container}>
          <RNCamera
            ref = {ref=>{
                this.camera=ref;
            }}
            style={styles.preview}
            flashMode={this.state.flashon}
            type={this.state.backCamera ? RNCamera.Constants.Type.back : RNCamera.Constants.Type.front} 
            captureAudio={this.state.captureAudio}
            androidCameraPermissionOptions={{
              title: 'Vocajam needs permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            androidRecordAudioPermissionOptions={{
              title: 'Vocajam needs Permission to use audio recording',
              message: 'We need your permission to use your audio',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
          >
              {
                ({ camera, status, androidRecordAudioPermissionOptions }) => {
                  if (status !== 'READY') return <PendingView />

                  return (
                    <View style={styles.action}>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15, alignItems: 'flex-end' }}>
                            <TouchableOpacity  onPress={this.toggleTorch.bind(this)}>
                                    { this.state.flashon == RNCamera.Constants.FlashMode.off? (
                                            <Icon
                                                name="md-flash-off"
                                                color="black"
                                                size={30} 
                                            />
                                        ) : (
                                            <Icon
                                                name="md-flash"
                                                color="white"
                                                size={30} 
                                            />
                                        )
                                    }
                                </TouchableOpacity>
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity onPress={this.takePicture} style={styles.captureBtn} />
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity onPress={this.recordVideo} style={styles.captureVideoBtn}>
                                      {
                                        this.state.recording ?
                                      (<Text>{this.secondsToMMSS(this.state.seconds)}</Text>) :
                                      (null)
                                      }
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                  onPress={this.reverseCamera}
                                  >
                                      <Icon
                                        name="md-reverse-camera"
                                        color="white"
                                        size={30} 
                                      />

                                  </TouchableOpacity>

                          </View>
                    </View>
                  )
                }
              }
              
          </RNCamera>

          <TouchableOpacity 
            style={styles.photoGalleryIcon}
            onPress={() => { this.toggleModal(); this.getPhotos() }}
          >
                <Image 
                  source={require('../images/photoGalleryIcon.png')}
                />
            </TouchableOpacity>

            <TouchableOpacity 
            style={styles.VideoGalleryIcon}
            onPress={() => { this.props.navigation.navigate('VideoGallery') }}
          >
                <Image 
                  source={require('../images/photoGalleryIcon.png')}
                />
            </TouchableOpacity>

            <Modal
              animationType={"slide"}
              transparent={false}
              visible={this.state.modalVisible}
              onRequestClose={() => console.log('closed')}
            >
              <View style={styles.modalContainer}>
                <Button
                  title='Close'
                  onPress={this.toggleModal}
                />
                <ScrollView
                  contentContainerStyle={styles.scrollView}>
                  {
                    this.state.photos.map((p, i) => {
                      const isSelected = i === this.state.index;
                      const divide = isSelected && this.share === true ? 1 : 3;
                      return (
                        <TouchableHighlight
                          style={{opacity: i === this.state.index ? 0.5 : 1}}
                          key={i}
                          underlayColor='transparent'
                          onPress={() => this.setIndex(i)}
                        >
                          <Image
                            style={{
                              width: width/divide,
                              height: width/divide
                            }}
                            source={{uri: p.node.image.uri}}
                          />
                        </TouchableHighlight>
                      )
                    })
                  }
                </ScrollView>
                {
                  this.state.index !== null  && (
                    <View style={styles.shareButton}>
                      <Button
                          title='Share'
                          onPress={this.share}
                        />
                    </View>
                  )
                }
              </View>
            </Modal>

         


          
      </View>
    );
  };
}
export default cameraComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
    },
    preview: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: 'center'
    },
    captureBtn: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderRadius: 60,
        borderColor: "#ffffff",
    },
    captureVideoBtn: {
      width: 60,
      height: 60,
      borderWidth: 2,
      borderRadius: 60,
      borderColor: 'red',
  },
   action: {
     flex: 0,
     flexDirection: 'row',
     justifyContent: 'center',
     backgroundColor: 'transparent',
     width: '100%'
   },
   photoGalleryIcon: {
     padding: 20,
     marginLeft: 50,
     position: 'absolute',
     left: 220,
     justifyContent: 'center',
     alignItems: 'center',
     top: 250
   },
   VideoGalleryIcon: {
    padding: 20,
     marginLeft: 50,
     position: 'absolute',
     left: 220,
     justifyContent: 'center',
     alignItems: 'center',
     top: 280
   },
   modalContainer: {
    paddingTop: 20,
    flex: 1
  },
  scrollView: {
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  shareButton: {
    position: 'absolute',
    width,
    padding: 10,
    bottom: 0,
    left: 0
  }
})