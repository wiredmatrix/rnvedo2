import React, { Component } from 'react';
import { 
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert
 } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Video from 'react-native-video';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MediaControls, { PLAYER_STATES } from 'react-native-media-controls';
import { Viewport } from '@skele/components';

 class VideoGallery extends Component {

    _isMounted = false;
    constructor(Props) {
        super(Props);
        this.state = {
          error: null,
          isLoading: false,
          videos: [],
          playing: false,
          currentTime: 10,
          duration: 0,
          isFullScreen: false,
          isLoading: true,
          paused: true,
          playerState: PLAYER_STATES.PLAYING,
          screenType: 'content',
          resizeMode: 'contain',
    
        };

        this.viewabilityConfig = {
            waitForInteraction: true,
            viewAreaCoveragePercentThreshold: 95
          }

          
      
      
        }
        onViewableItemsChanged = ({ viewableItems, changed }) => {
            console.log("Visible items are", viewableItems);
            console.log("Changed in this iteration", changed);
          }
    
    componentDidMount() {
        var filePath = RNFetchBlob.fs.dirs.MovieDir + '/Vocajam Videos/';
        RNFetchBlob.fs.ls(filePath)
        .then(files => {
        this.setState({videos:files});
        console.warn(files);
        }).catch(err=>alert(err.toString()))
    }

    onLoad = (data) => {
        this.setState({ duration: data.duration });
      };
    
      onProgress = (data) => {
        this.setState({ currentTime: data.currentTime });
      };
    
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

      
    


    render() {
        const { duration, paused, overlay } = this.state
        // console.log(this.state.videos);
        return(
           <View style={styles.container}>
             <Viewport.Tracker>
               <FlatList
                data={this.state.videos}
                keyExtractor={item=>item}
                ItemSeparatorComponent={() => { return (<View style={styles.separator} />) }}
                viewabilityConfig={this.viewabilityConfig}

                onViewableItemsChanged={this.onViewableItemsChanged}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 95
                  }}
                  numColumns={3}
                  renderItem={({ item, index, separators }) => (
                    <TouchableOpacity
                        onPress={() => this._onPress(item)}       
                        style={{width:100,height:100}}>
                          <View
                        style={{width:100,height:100, margin:8}}
                        >
                            <Video
                                source ={{uri: '/storage/emulated/0/Movies/Vocajam Videos/'+{item}}}
                                ref={(ref) => {this.player = ref;}}
                                style={{width:100,height:100}}
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

                            />
                            <MediaControls
                                duration={this.state.duration}
                                isLoading={this.state.isLoading}
                                mainColor="#333"
                                onFullScreen={this.onFullScreen}
                                onPaused={this.onPaused}
                                onReplay={this.onReplay}
                                onSeek={this.onSeek}
                                onSeeking={this.onSeeking}
                                playerState={this.state.playerState}
                                progress={this.state.currentTime}
                                // toolbar={this.renderToolbar()} 
                            />
                            
                        </View>
                    </TouchableOpacity>
                )}   
               />
              </Viewport.Tracker>
               
           </View>
        )
    }
 }

 const styles = StyleSheet.create({
     container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
     },
     item: {  
        padding: 10,  
        fontSize: 18,  
        height: 44,  
    },  
 })
export default VideoGallery;