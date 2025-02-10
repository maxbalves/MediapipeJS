// TODO: Add hip / shoulder angles

export function incrementRepCounter(){
    // takes care of incrementing the Javascript UI and variable by one
}

export function pushup(angles_dict, stage) {
    if (stage == "up" && angles_dict["left_elbow"] <= 100 && angles_dict["right_elbow"] <= 100) {
        stage = "down";
    }
    if (stage == "down" && angles_dict["left_elbow"] >= 150 && angles_dict["right_elbow"] >= 150) {
        stage = "up";
        incrementRepCounter();
    }
}

export function squat(angles_dict, stage) {
    if (stage == "up" && angles_dict["left_knee"] <= 110 && angles_dict["right_knee"] <= 110) {
        stage = "down";
    }
    if (stage == "down" && angles_dict["left_knee"] >= 160 && angles_dict["right_knee"] >= 160) {
        stage = "up";
        incrementRepCounter();
    }
}
