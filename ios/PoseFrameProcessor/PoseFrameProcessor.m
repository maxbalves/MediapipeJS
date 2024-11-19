#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("MediapipeJS/MediapipeJS-Swift.h")
#import "MediapipeJS/MediapipeJS-Swift.h"
#else
#import "MediapipeJS-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(PoseFrameProcessorPlugin, poseFrameProcessor)