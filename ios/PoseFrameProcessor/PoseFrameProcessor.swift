import VisionCamera
import MediaPipeTasksVision

@objc(PoseFrameProcessorPlugin)
public class PoseFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    let buffer = frame.buffer
    let orientation = frame.orientation
    
    let modelPath = Bundle.main.path(forResource: "pose_landmarker_full",
                                          ofType: "task")
    let options = PoseLandmarkerOptions()
    options.baseOptions.modelAssetPath = modelPath!
    options.runningMode = .video
    options.minPoseDetectionConfidence = 0.5
    options.minPosePresenceConfidence = 0.5
    options.minTrackingConfidence = 0.5
    options.numPoses = 1
    
    do {
      let poseLandmarker = try PoseLandmarker(options: options)
      let image = try MPImage(sampleBuffer: buffer)
      let result = try poseLandmarker.detect(videoFrame: image, timestampInMilliseconds: Int(frame.timestamp))
      
      var landmarks = [] as Array
            
      for pose in result.landmarks {
        for landmark in pose {
          landmarks.append([
            "x" : landmark.x,
            "y" : landmark.y,
            "z" : landmark.z,
            "visibility" : landmark.visibility as Any,
            "presence" : landmark.presence as Any,
          ])
        }
      }
      
      return landmarks
    } catch {
      return [error.localizedDescription] as Array
    }
  }
}
