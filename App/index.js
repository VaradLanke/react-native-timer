import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Picker,
  Platform,
  ToastAndroid,
} from "react-native";
import { Audio } from "expo-av";

const screen = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07121B",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderWidth: 10,
    borderColor: "#89AAFF",
    width: screen.width / 2,
    height: screen.width / 2,
    borderRadius: screen.width / 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  buttonStop: {
    borderColor: "#FF851B",
  },
  buttonText: {
    fontSize: 45,
    color: "#89AAFF",
  },
  buttonTextStop: {
    color: "#FF851B",
  },
  timerText: {
    fontSize: 90,
    color: "#fff",
  },
  picker: {
    width: 50,
    ...Platform.select({
      android: {
        color: "#fff",
        backgroundColor: "#07121B",
        marginLeft: 10,
      },
    }),
  },
  pickerItem: {
    color: "#fff",
    fontSize: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

const formatNumber = (number) => `0${number}`.slice(-2);

const getRemaining = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return {
    minutes: formatNumber(minutes),
    seconds: formatNumber(seconds),
  };
};

const createArray = (length) => {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(i.toString());
  }
  return arr;
};

const Toast = (props) => {
  if (props.visible) {
    ToastAndroid.showWithGravityAndOffset(
      props.message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
    return null;
  }
  return null;
};

const AVAILABLE_MINUTES = createArray(10);
const AVAILABLE_SECONDS = createArray(60);

export default class App extends React.Component {
  state = {
    remainingTime: 5,
    isRunning: false,
    selectedMinutes: "0",
    selectedSeconds: "0",
    visible: false,
  };

  componentDidUpdate(prevProp, prevState) {
    if (this.state.remainingTime === 0 && prevState.remainingTime !== 0) {
      this.playSound();
      this.stop();
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  handleButtonPress = () => {
    this.setState(
      {
        visible: true,
      },
      () => {
        this.hideToast();
      }
    );
  };

  hideToast = () => {
    this.setState({
      visible: false,
    });
  };

  playSound = async () => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(require("../assets/sounds/timesup.mp3"));
      await soundObject.playAsync();
      // Your sound is playing!
    } catch (error) {
      // An error occurred!
    }
  };

  start = () => {
    this.setState((state) => ({
      remainingTime:
        parseInt(state.selectedMinutes, 10) * 60 +
        parseInt(state.selectedSeconds, 10),
      isRunning: true,
    }));

    console.log(this.state.remainingTime);

    this.interval = setInterval(() => {
      this.setState((state) => ({
        remainingTime: state.remainingTime - 1,
        isRunning: true,
      }));
    }, 1000);
  };

  stop = () => {
    clearInterval(this.interval);
    this.interval = null;
    this.setState({
      remainingTime: 5,
      isRunning: false,
      selectedMinutes: 0,
      selectedSeconds: 0,
    });
    this.handleButtonPress();
  };

  renderPickers = () => {
    return (
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          itemStyle={styles.pickerItem}
          selectedValue={this.state.selectedMinutes}
          onValueChange={(itemValue) => {
            this.setState({ selectedMinutes: itemValue });
          }}
          mode="dropdown"
        >
          {AVAILABLE_MINUTES.map((value) => (
            <Picker.Item key={value} label={value} value={value} />
          ))}
        </Picker>
        <Text style={styles.pickerItem}>minutes</Text>
        <Picker
          style={styles.picker}
          itemStyle={styles.pickerItem}
          selectedValue={this.state.selectedSeconds}
          onValueChange={(itemValue) => {
            this.setState({ selectedSeconds: itemValue });
          }}
          mode="dropdown"
        >
          {AVAILABLE_SECONDS.map((value) => (
            <Picker.Item key={value} label={value} value={value} />
          ))}
        </Picker>
        <Text style={styles.pickerItem}>seconds</Text>
      </View>
    );
  };

  render() {
    const { minutes, seconds } = getRemaining(this.state.remainingTime);
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {this.state.isRunning ? (
          <Text style={styles.timerText}>{`${minutes}:${seconds}`}</Text>
        ) : (
          this.renderPickers()
        )}
        {this.state.isRunning ? (
          <TouchableOpacity
            onPress={this.stop}
            style={[styles.button, styles.buttonStop]}
          >
            <Text style={[styles.buttonText, styles.buttonTextStop]}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={this.start} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
        <Toast
          visible={this.state.visible}
          message="Tone Will off in 7 seconds!"
        />
      </View>
    );
  }
}
