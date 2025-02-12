import { Skia, PaintStyle, matchFont } from '@shopify/react-native-skia';

export function drawLandmarkLine(frame, landmarks_dict, l0, l1) {
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