import React, { useState, useRef } from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { Skia, PaintStyle, matchFont } from '@shopify/react-native-skia';
import { computeAngles, computeLandmarks, drawSkeleton } from './PoseDetection';
import { pushup } from './exercises';
import { useRunOnJS } from 'react-native-worklets-core';
import Icon from 'react-native-vector-icons/FontAwesome';

// TODO: Flip camera button, Stop session button, and change model button

// Initialize Frame Processor Plugin
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseFrameProcessor', {});

// Define dictionaries of landmarks and angles
let landmarks_dict = {};
let angles_dict = {};

// Debug variables
const DISPLAY_ANGLES = true;

export function poseFrameProcessor(frame) {
	'worklet';
	if (plugin == null) {
		throw new Error('Failed to load Frame Processor Plugin!');
	}
	return plugin.call(frame);
}

export default function App() {
	const [cameraDevice, setCameraDevice] = useState('front');
	const device = useCameraDevice(cameraDevice);
	const { hasPermission } = useCameraPermission();

	// State to control landmark and angle visibility
	const [showLandmarks, setShowLandmarks] = useState(true);
	const [showAngles, setShowAngles] = useState(true);
	const [showReps, setReps] = useState(true);
	const [repetitionCount, setRepetitions] = useState(0);

	// Use useRef for rep count and stage to persist the values without triggering re-renders
	const repCountRef = useRef(0);
	const stageRef = useRef("up");

	const updateReps = useRunOnJS((reps) => {
		repCountRef.current = reps;
		setRepetitions(reps);
	}, []);

	// Set color of joints and skeleton 
	const paint = Skia.Paint();
	paint.setStyle(PaintStyle.Fill);
	paint.setStrokeWidth(2);
	paint.setColor(Skia.Color('red'));

	// Set font for Skia text
	const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
	const fontStyle = {
		fontFamily,
		fontSize: 54, // Increased font size
		fontStyle: "normal",
		fontWeight: "bold",
	};
	const font = matchFont(fontStyle);

	// Frame Processor Logic
	const frameProcessor = useSkiaFrameProcessor((frame) => {
		'worklet';
		const data = poseFrameProcessor(frame);

		// Compute dictionary of landmarks and angles
		landmarks_dict = computeLandmarks(data);
		angles_dict = computeAngles(landmarks_dict);
		frame.render();
		const frameWidth = frame.width;
		const frameHeight = frame.height;

		// Call pushup function and pass in the setRepCount callback
		// stageRef, repCountRef = pushup(angles_dict, stageRef, repCountRef);
		pushup(angles_dict, stageRef, repCountRef);
		let rep = repCountRef.current;
		updateReps(rep);
		let stage = stageRef.current;
		console.log("CURRENT REP: " + rep);
		console.log("STAGE: " + stage);

		// if (showReps) {
		// 	let str = String(rep);
		// 	let text = "Rep Count: " + str + "";
		// 	let paint = Skia.Paint();
		// 	paint.setColor(Skia.Color('white'));

		// 	frame.drawText(text, 100, 200, paint, font);
		// }


		// Draw circles (landmarks)
		if (showLandmarks) {
			for (const mark of data || []) {
				frame.drawCircle(
					mark.x * Number(frameWidth),
					mark.y * Number(frameHeight),
					6,
					paint,
				);
			}
		}

		// Draw skeleton
		if (showLandmarks) {
			drawSkeleton(frame, landmarks_dict);
		}

		// Draw angles
		if (showAngles) {
			for (const [landmark, angle] of Object.entries(angles_dict)) {
				if (angle == undefined || angle < 0 || angle > 360)
					continue;
				let x = landmarks_dict[landmark]['x'] * Number(frameWidth);
				let y = landmarks_dict[landmark]['y'] * Number(frameHeight);
				let text = parseInt(angle) + "°";
				let paint = Skia.Paint();
				paint.setColor(Skia.Color('white'));

				frame.drawText(text, x, y, paint, font);
			}
		}
	}, [showLandmarks, showAngles]); // Add showLandmarks and showAngles as dependencies

	const flipCamera = () => {
		setCameraDevice((prevDevice) => (prevDevice === 'front' ? 'back' : 'front'));
	};

	return (
		<View style={styles.container}>
			<Camera
				style={StyleSheet.absoluteFill}
				device={device}
				isActive={true}
				frameProcessor={frameProcessor}
				pixelFormat='rgb'
				enableFpsGraph={true}
				outputOrientation="preview"
			/>
			<View style={styles.repCounterContainer}>
				<Text style={styles.repCounterText}>Reps: {repetitionCount}</Text>
			</View>
			<View style={styles.anglesButtonContainer}>
				<Button
					title={showAngles ? "Hide Angles" : "Show Angles"}
					onPress={() => setShowAngles(!showAngles)}
				/>
			</View>
			<View style={styles.landmarksButtonContainer}>
				<Button
					title={showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
					onPress={() => setShowLandmarks(!showLandmarks)}
				/>
			</View>
			<View style={styles.flipButtonContainer}>
				{/* Flip Camera Button with Icon */}
				<Icon
					name="refresh" // You can use any icon here (e.g., "camera" for a camera icon)
					size={30}
					color="#fff"
					onPress={flipCamera}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	repCounterContainer: {
		position: 'absolute',
		top: 50,
		right: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 10,
		borderRadius: 5,
	},
	repCounterText: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
	},
	anglesButtonContainer: {
		position: 'absolute',
		bottom: 80, // Higher bottom value to place above the landmarks button
	},
	landmarksButtonContainer: {
		position: 'absolute',
		bottom: 20, // Lower bottom value to place below the angles button
	},
	flipButtonContainer: {
		position: 'absolute',
		top: 100,
		right: 20,
	},
});
