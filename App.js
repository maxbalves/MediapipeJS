import { Platform, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { Skia, PaintStyle, matchFont } from '@shopify/react-native-skia';
import { computeAngles, computeLandmarks, drawSkeleton } from './PoseDetection';

// Initialize Frame Processor Plugin
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseFrameProcessor', {});

// Define dictionaries of landmarks and angles
let landmarks_dict = {};
let angles_dict = {};

// Debug variables
const DISPLAY_ANGLES = true;
const DISPLAY_SKELETON = true;

export function poseFrameProcessor(frame) {
	'worklet';
	if (plugin == null) {
		throw new Error('Failed to load Frame Processor Plugin!');
	}
	return plugin.call(frame);
}

export default function App() {
	const device = useCameraDevice('back');
	const { hasPermission } = useCameraPermission();

	// Set color of joints and skeleton 
	const paint = Skia.Paint();
	paint.setStyle(PaintStyle.Fill);
	paint.setStrokeWidth(2);
	paint.setColor(Skia.Color('red'));

	// Set font for Skia text
	const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
	const fontStyle = {
		fontFamily,
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "bold",
	};
	const font = matchFont(fontStyle);

	const frameProcessor = useSkiaFrameProcessor((frame) => {
		'worklet';
		const data = poseFrameProcessor(frame);

		// Compute dictionary of landmarks
		landmarks_dict = computeLandmarks(data);
		// console.log(landmarks_dict)

		// Compute primary angles
		angles_dict = computeAngles(landmarks_dict)
		console.log(angles_dict)

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

		// Draw skeleton
		if (DISPLAY_SKELETON == true) {
			drawSkeleton(frame, landmarks_dict);
		}

		// Draw angles
		// TODO: Investigate vertical orientation and font-size
		// TODO: Export to PoseDetection.js for better readability
		if (DISPLAY_ANGLES == true) {
			for (const [landmark, angle] of Object.entries(angles_dict)) {
				if (angle == undefined || angle < 0 || angle > 360)
					continue;
				let x = landmarks_dict[landmark]['x'] * Number(frameWidth);
				let y = landmarks_dict[landmark]['y'] * Number(frameHeight);
				let text = parseInt(angle) + "°";
				let paint = Skia.Paint();
				paint.setColor(Skia.Color('white'));

				// console.log(`Drawing text at (${x}, ${y}) | Angle: ${angle}`)
				frame.drawText(text, x, y, paint, font);
			}
		}
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
