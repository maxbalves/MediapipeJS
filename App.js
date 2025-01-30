import { Platform, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { Skia, PaintStyle, matchFont } from '@shopify/react-native-skia';
import { computeAngles, computeLandmarks } from './PoseDetection';

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

		function drawLandmarkLine(frame, landmarks_dict, l0, l1) {
			'worklet';
			if (Object.keys(landmarks_dict).length === 0) return;

			// Frame Dimensions
			let frameWidth = frame.width;
			let frameHeight = frame.height;

			console.log(`Frame ${frameWidth} x ${frameHeight}`)

			// Landmark Coordinates
			let x0 = landmarks_dict[l0]['x'] * Number(frameWidth);
			let y0 = landmarks_dict[l0]['y'] * Number(frameHeight);
			let x1 = landmarks_dict[l1]['x'] * Number(frameWidth);
			let y1 = landmarks_dict[l1]['y'] * Number(frameHeight);

			// Line Style
			let paint = Skia.Paint();
			paint.setStyle(PaintStyle.Fill);
			paint.setStrokeWidth(2);
			paint.setColor(Skia.Color('pink'));

			// Draw
			frame.drawLine(x0, y0, x1, y1, paint);
			console.log(`Drawing line at (${x0}, ${y0}) | (${x1}, ${y1})`)
		}

		// Draw skeleton
		// TODO: Improve readability (maybe export to function)
		if (DISPLAY_SKELETON == true) {
			drawLandmarkLine(frame, landmarks_dict, "left_wrist", "left_elbow");
			drawLandmarkLine(frame, landmarks_dict, "left_elbow", "left_shoulder");
			drawLandmarkLine(frame, landmarks_dict, "left_shoulder", "left_hip");
			drawLandmarkLine(frame, landmarks_dict, "left_hip", "left_knee");
			drawLandmarkLine(frame, landmarks_dict, "left_knee", "left_ankle");
			drawLandmarkLine(frame, landmarks_dict, "left_shoulder", "right_shoulder");
			drawLandmarkLine(frame, landmarks_dict, "left_hip", "right_hip");
			drawLandmarkLine(frame, landmarks_dict, "right_shoulder", "right_hip");
			drawLandmarkLine(frame, landmarks_dict, "right_shoulder", "right_elbow");
			drawLandmarkLine(frame, landmarks_dict, "right_elbow", "right_wrist");
			drawLandmarkLine(frame, landmarks_dict, "right_hip", "right_knee");
			drawLandmarkLine(frame, landmarks_dict, "right_knee", "right_ankle");
		}

		// Draw angles
		// TODO: Investigate vertical orientation and font-size
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
