import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { Skia, PaintStyle } from '@shopify/react-native-skia';

// Initialize Frame Processor Plugin
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseFrameProcessor', {});

// Define dictionaries of landmarks and angles
const landmarks_dict = {}

export function poseFrameProcessor(frame) {
	'worklet';
	if (plugin == null) {
		throw new Error('Failed to load Frame Processor Plugin!');
	}
	return plugin.call(frame);
}

// export function computeAngles(landmarks) {
// 	// Left elbow
// 	angles_dict[""] = calculateAngle(landmarks[0], landmarks[1], landmarks[2]);
// 	// Right elbow
// 	angles_dict[""] = calculateAngle(landmarks[0], landmarks[1], landmarks[2]);
// 	// Left knee
// 	angles_dict[""] = calculateAngle(landmarks[0], landmarks[1], landmarks[2]);
// 	// Right knee
// 	angles_dict[""] = calculateAngle(landmarks[0], landmarks[1], landmarks[2]);
// 	// Left shoulder
// 	angles_dict[""] = calculateAngle(landmarks[0], landmarks[1], landmarks[2]);
// 	// Right shoulder
// 	angles_dict[""] = calculateAngle(landmarks[0], landmarks[1], landmarks[2]);
// }

export function computeLandmarks(data) {
	'worklet';
	if (data.length == 0) return {};

	let landmarks = {};
	// Nose - 0 index
	landmarks["nose"] = {"x" : data[0]["x"], "y" : data[0]["y"], "z" : data[0]["z"], "visibility" : data[0]["visibility"], "presence" : data[0]["presence"]};
	return landmarks;
}

// Calculate angle function
// TODO: Utilize 3D angles
export function calculateAngle(a, b, c) {
	'worklet';
	if (a == undefined || b == undefined || c == undefined)
		return -1;

	// Define angles as arrays and calculate using atan2 for 2D
	a = [a['x'], a['y']];
	b = [b['x'], b['y']];
	c = [c['x'], c['y']];
	let radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);

	// Convert radians to degrees
	let angle = Math.abs(radians * 180.0 / Math.PI);

	// Ensure angle is between 0 and 180 degrees
	if (angle > 180.0)
		angle = 360 - angle;

	return angle;
}

export default function App() {
	const device = useCameraDevice('front');
	const { hasPermission } = useCameraPermission();

	const paint = Skia.Paint();
	paint.setStyle(PaintStyle.Fill);
	paint.setStrokeWidth(2);
	paint.setColor(Skia.Color('red'));

	const frameProcessor = useSkiaFrameProcessor((frame) => {
		'worklet';
		const data = poseFrameProcessor(frame);

		// Compute dictionary of landmarks
		// landmarks_dict = computeLandmarks(data);
		// console.log(landmarks_dict)

		frame.render()
		const frameWidth = frame.width;
		const frameHeight = frame.height;

		// Draw circles
		for (const mark of data || []) {
			frame.drawCircle(
				mark.x * Number(frameWidth),
				mark.y * Number(frameHeight),
				6,
				paint,
			);
		}

		// Example: Calculate angle between three points (e.g., shoulder, elbow, wrist)
		// You should replace the below coordinates with actual detected points from `data`
		// const left_shoulder = data[]; // Example values
		// const left_elbow = data[14];
		// const left_wrist = data[16];

		// const angle = calculateAngle(left_shoulder, left_elbow, left_wrist);
		// console.log(`Calculated angle: ${angle}`);
		// console.log(`Variable: ${variable}`)
	}, []);

	return (
		<Camera
			style={StyleSheet.absoluteFill}
			device={device}
			isActive={true}
			frameProcessor={frameProcessor}
			pixelFormat='rgb'
			enableFpsGraph={true}
		/>
	);
}
