import { Skia, PaintStyle } from '@shopify/react-native-skia';

// Function to calculate angles between three points
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

// Function to compute primary angles (exercises include: pushups, pullups, squats)
// TODO: Investigate camera inverting with front-camera
export function computeAngles(landmarks) {
	'worklet';
	if (landmarks.length == 0) return {};
	let angles = {};

	angles["left_elbow"] = calculateAngle(landmarks["left_wrist"], landmarks["left_elbow"], landmarks["left_shoulder"]);
	angles["right_elbow"] = calculateAngle(landmarks["right_wrist"], landmarks["right_elbow"], landmarks["right_shoulder"]);
	angles["left_knee"] = calculateAngle(landmarks["left_hip"], landmarks["left_knee"], landmarks["left_ankle"]);
	angles["right_knee"] = calculateAngle(landmarks["right_hip"], landmarks["right_knee"], landmarks["right_ankle"]);
	angles["left_hip"] = calculateAngle(landmarks["left_shoulder"], landmarks["left_hip"], landmarks["left_knee"]);
	angles["right_hip"] = calculateAngle(landmarks["right_shoulder"], landmarks["right_hip"], landmarks["right_knee"]);

	return angles;
}

// TODO: Investigate inverted body angles with front-camera
export function computeLandmarks(data) {
	'worklet';
	if (data.length == 0) return {};

	let landmarks = {};
	// Nose - 0 index
	landmarks["nose"] = {"x" : data[0]["x"], "y" : data[0]["y"], "z" : data[0]["z"], "visibility" : data[0]["visibility"], "presence" : data[0]["presence"]};
	// Left shoulder - 11 index
	landmarks["left_shoulder"] = {"x" : data[11]["x"], "y" : data[11]["y"], "z" : data[11]["z"], "visibility" : data[11]["visibility"], "presence" : data[11]["presence"]};
	// Right shoulder - 12 index
	landmarks["right_shoulder"] = {"x" : data[12]["x"], "y" : data[12]["y"], "z" : data[12]["z"], "visibility" : data[12]["visibility"], "presence" : data[12]["presence"]};
	// Left elbow - 13 index
	landmarks["left_elbow"] = {"x" : data[13]["x"], "y" : data[13]["y"], "z" : data[13]["z"], "visibility" : data[13]["visibility"], "presence" : data[13]["presence"]};
	// Right elbow - 14 index
	landmarks["right_elbow"] = {"x" : data[14]["x"], "y" : data[14]["y"], "z" : data[14]["z"], "visibility" : data[14]["visibility"], "presence" : data[14]["presence"]};
	// Left wrist - 15 index
	landmarks["left_wrist"] = {"x" : data[15]["x"], "y" : data[15]["y"], "z" : data[15]["z"], "visibility" : data[15]["visibility"], "presence" : data[15]["presence"]};
	// Right wrist - 16 index
	landmarks["right_wrist"] = {"x" : data[16]["x"], "y" : data[16]["y"], "z" : data[16]["z"], "visibility" : data[16]["visibility"], "presence" : data[16]["presence"]};
	// Left hip - 23 index
	landmarks["left_hip"] = {"x" : data[23]["x"], "y" : data[23]["y"], "z" : data[23]["z"], "visibility" : data[23]["visibility"], "presence" : data[23]["presence"]};
	// Right hip - 24 index
	landmarks["right_hip"] = {"x" : data[24]["x"], "y" : data[24]["y"], "z" : data[24]["z"], "visibility" : data[24]["visibility"], "presence" : data[24]["presence"]};
	// Left knee - 25 index
	landmarks["left_knee"] = {"x" : data[25]["x"], "y" : data[25]["y"], "z" : data[25]["z"], "visibility" : data[25]["visibility"], "presence" : data[25]["presence"]};
	// Right knee - 26 index
	landmarks["right_knee"] = {"x" : data[26]["x"], "y" : data[26]["y"], "z" : data[26]["z"], "visibility" : data[26]["visibility"], "presence" : data[26]["presence"]};
	// Left ankle - 27 index
	landmarks["left_ankle"] = {"x" : data[27]["x"], "y" : data[27]["y"], "z" : data[27]["z"], "visibility" : data[27]["visibility"], "presence" : data[27]["presence"]};
	// Right ankle - 28 index
	landmarks["right_ankle"] = {"x" : data[28]["x"], "y" : data[28]["y"], "z" : data[28]["z"], "visibility" : data[28]["visibility"], "presence" : data[28]["presence"]};
	
	return landmarks;
}

function drawLandmarkLine(frame, landmarks_dict, l0, l1) {
	'worklet';
	if (Object.keys(landmarks_dict).length === 0) return;

	// Frame Dimensions
	let frameWidth = frame.width;
	let frameHeight = frame.height;
	// console.log(`Frame ${frameWidth} x ${frameHeight}`)

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
	// console.log(`Drawing line at (${x0}, ${y0}) | (${x1}, ${y1})`)
}

export function drawSkeleton(frame, landmarks_dict) {
	'worklet';
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
