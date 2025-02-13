// Push-up movement thresholds below
// TODO: Add hip/shoulder angles
const ANGLE_THRESHOLD_UP = 130;
const ANGLE_THRESHOLD_DOWN = 90; 

// Function to detect if a push-up has been completed and return the updated stage
export function pushup(angles_dict, currentStage, currentRep) {
    'worklet';
    const leftElbowAngle = angles_dict['left_elbow'];
    const rightElbowAngle = angles_dict['right_elbow'];

    if (leftElbowAngle < ANGLE_THRESHOLD_DOWN && rightElbowAngle < ANGLE_THRESHOLD_DOWN) {
        if (currentStage.current !== 'down') {
            currentStage.current = 'down';
        }
    } 
    else if (leftElbowAngle > ANGLE_THRESHOLD_UP && rightElbowAngle > ANGLE_THRESHOLD_UP) {
        if (currentStage.current === 'down') {
            currentStage.current = 'up';
            currentRep.current += 1;
        }
  }
//   console.log("NEW/SAME STAGE: " + currentStage.current);
//   console.log("NEW STAGE: " + newStage);
//   return currentStage, currentRep;
}

export function squat(angles_dict, currentStage, currentRep) {
  // Implement similar logic for squat tracking
}
