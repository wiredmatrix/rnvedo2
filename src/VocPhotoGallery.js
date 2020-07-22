import React, { Component } from 'react';
import { View, 
    Text, 
    TouchableHighlight, 
    Modal, 
    StyleSheet, 
    Button,
    Image,
    Dimensions,
    ScrollView  
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import Video from 'react-native-video';
import { TouchableOpacity } from 'react-native-gesture-handler';


const { width } = Dimensions.get('window')

class VocPhotoGallery extends Component {
  constructor(props) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.state = {
        modalVisible: false,
        photos: [],
        videos: [],
        index: null,
        rate: 1,
        volume: 1,
        muted: false,
        resizeMode: 'contain',
        duration: 0.0,
        currentTime: 0.0,
        paused: true,
    }
  }
  
  video: Video;

  onLoad = (data) => {
    this.setState({ duration: data.duration });
  };

  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });
  }

  onEnd = () => {
    this.setState({ paused: true })
    this.video.seek(0)
  };

  onAudioBecomingNoisy = () => {
    this.setState({ paused: true })
  };

  onAudioFocusChanged = (event: { hasAudioFocus: boolean }) => {
    this.setState({ paused: !event.hasAudioFocus })
  };

  getCurrentTimePercentage() {
    if (this.state.currentTime > 0) {
      return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
    }
    return 0;
  };  

  renderRateControl(rate) {
    const isSelected = (this.state.rate === rate);

    return (
      <TouchableOpacity onPress={() => { this.setState({ rate }) }}>
        <Text style={[styles.controlOption, { fontWeight: isSelected ? 'bold' : 'normal' }]}>
          {rate}x
        </Text>
      </TouchableOpacity>
    );
  }

  renderResizeModeControl(resizeMode) {
    const isSelected = (this.state.resizeMode === resizeMode);

    return (
      <TouchableOpacity onPress={() => { this.setState({ resizeMode }) }}>
        <Text style={[styles.controlOption, { fontWeight: isSelected ? 'bold' : 'normal' }]}>
          {resizeMode}
        </Text>
      </TouchableOpacity>
    )
  }

  renderVolumeControl(volume) {
    const isSelected = (this.state.volume === volume);

    return (
      <TouchableOpacity onPress={() => { this.setState({ volume }) }}>
        <Text style={[styles.controlOption, { fontWeight: isSelected ? 'bold' : 'normal' }]}>
          {volume * 100}%
        </Text>
      </TouchableOpacity>
    )
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
          groupName: 'Vocajam Videos',
          assetType: 'Videos'
      })
      .then(r => this.setState({ videos: r.edges}))
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible})
}


share = () => {
  const video = this.state.videos[this.state.index].node.video.uri
  RNFetchBlob.fs.readFile(video, 'base64')
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
      const flexCompleted = this.getCurrentTimePercentage() * 100;
      const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;
      // console.log('state :', this.state)
      return (
        <View style={styles.container}>
          <Button
            title='View videos'
            onPress={() => { this.toggleModal(); this.getPhotos() }}
          />
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
                    this.state.videos.map((p, i) => {
                      const isSelected = i === this.state.index;
                      const divide = isSelected && this.share === true ? 1 : 3;
                      return (
                        <View>
                          <TouchableOpacity
                            style={{opacity: i === this.state.index ? 0.5 : 1}}
                            style={styles.fullScreen}
                            key={i}
                            underlayColor='transparent'
                            onPress={() => this.setIndex(i)}
                            onPress={() => this.setState({ paused: !this.state.paused })}
                          >
                            {/* <Image
                              style={{
                                width: width/divide,
                                height: width/divide
                              }}
                              source={{uri: p.node.image.uri}}
                            /> */}
                            
                            <Video
                                ref={(ref: Video) => { this.video = ref }}
                                key={i}
                                style={{
                                  width: width/divide,
                                  height: width/divide
                                }}
                                source={{uri: p.node.image.uri}}
                                style={styles.fullScreen}
                                rate={this.state.rate}
                                paused={this.state.paused}
                                volume={this.state.volume}
                                muted={this.state.muted}
                                resizeMode={this.state.resizeMode}
                                onLoad={this.onLoad}
                                onProgress={this.onProgress}
                                onEnd={this.onEnd}
                                onAudioBecomingNoisy={this.onAudioBecomingNoisy}
                                onAudioFocusChanged={this.onAudioFocusChanged}
                                repeat={false}
                              />
                              </TouchableOpacity>
                              <React.Fragment>
                                <View style={styles.controls}>
                                  <View style={styles.generalControls}>
                                    <View style={styles.rateControl}>
                                      {this.renderRateControl(0.25)}
                                      {this.renderRateControl(0.5)}
                                      {this.renderRateControl(1.0)}
                                      {this.renderRateControl(1.5)}
                                      {this.renderRateControl(2.0)}
                                    </View>

                                    <View style={styles.volumeControl}>
                                      {this.renderVolumeControl(0.5)}
                                      {this.renderVolumeControl(1)}
                                      {this.renderVolumeControl(1.5)}
                                    </View>

                                    <View style={styles.resizeModeControl}>
                                      {this.renderResizeModeControl('cover')}
                                      {this.renderResizeModeControl('contain')}
                                      {this.renderResizeModeControl('stretch')}
                                    </View>
                                  </View>

                                  <View style={styles.trackingControls}>
                                    <View style={styles.progress}>
                                      <View style={[styles.innerProgressCompleted, { flex: flexCompleted }]} />
                                      <View style={[styles.innerProgressRemaining, { flex: flexRemaining }]} />
                                    </View>
                                  </View>
                                </View>
                              </React.Fragment>

                                
                        
                        </View>
                        
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
        )
      }
    }
    
   const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
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
      },
      fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
      controls: {
        backgroundColor: "transparent",
        borderRadius: 5,
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
      },
      progress: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 3,
        overflow: 'hidden',
      },
      innerProgressCompleted: {
        height: 20,
        backgroundColor: '#cccccc',
      },
      innerProgressRemaining: {
        height: 20,
        backgroundColor: '#2C2C2C',
      },
      generalControls: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 4,
        overflow: 'hidden',
        paddingBottom: 10,
      },
      rateControl: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
      },
      volumeControl: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
      },
      resizeModeControl: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      controlOption: {
        alignSelf: 'center',
        fontSize: 11,
        color: "white",
        paddingLeft: 2,
        paddingRight: 2,
        lineHeight: 12,
      }
    })

export default VocPhotoGallery;