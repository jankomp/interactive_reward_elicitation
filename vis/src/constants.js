export const n_s= 23 // number of state feature
export const n_a= 7 // number of action feature
// Observation Space
// | Num | Observation                                              | Min  | Max | Name (in corresponding XML file) | Joint    | Unit                     |
// | --- | -------------------------------------------------------- | ---- | --- | -------------------------------- | -------- | ------------------------ |
// | 0   | Rotation of the panning the shoulder                     | -Inf | Inf | r_shoulder_pan_joint             | hinge    | angle (rad)              |
// | 1   | Rotation of the shoulder lifting joint                   | -Inf | Inf | r_shoulder_lift_joint            | hinge    | angle (rad)              |
// | 2   | Rotation of the shoulder rolling joint                   | -Inf | Inf | r_upper_arm_roll_joint           | hinge    | angle (rad)              |
// | 3   | Rotation of hinge joint that flexed the elbow            | -Inf | Inf | r_elbow_flex_joint               | hinge    | angle (rad)              |
// | 4   | Rotation of hinge that rolls the forearm                 | -Inf | Inf | r_forearm_roll_joint             | hinge    | angle (rad)              |
// | 5   | Rotation of flexing the wrist                            | -Inf | Inf | r_wrist_flex_joint               | hinge    | angle (rad)              |
// | 6   | Rotation of rolling the wrist                            | -Inf | Inf | r_wrist_roll_joint               | hinge    | angle (rad)              |
// | 7   | Rotational velocity of the panning the shoulder          | -Inf | Inf | r_shoulder_pan_joint             | hinge    | angular velocity (rad/s) |
// | 8   | Rotational velocity of the shoulder lifting joint        | -Inf | Inf | r_shoulder_lift_joint            | hinge    | angular velocity (rad/s) |
// | 9   | Rotational velocity of the shoulder rolling joint        | -Inf | Inf | r_upper_arm_roll_joint           | hinge    | angular velocity (rad/s) |
// | 10  | Rotational velocity of hinge joint that flexed the elbow | -Inf | Inf | r_elbow_flex_joint               | hinge    | angular velocity (rad/s) |
// | 11  | Rotational velocity of hinge that rolls the forearm      | -Inf | Inf | r_forearm_roll_joint             | hinge    | angular velocity (rad/s) |
// | 12  | Rotational velocity of flexing the wrist                 | -Inf | Inf | r_wrist_flex_joint               | hinge    | angular velocity (rad/s) |
// | 13  | Rotational velocity of rolling the wrist                 | -Inf | Inf | r_wrist_roll_joint               | hinge    | angular velocity (rad/s) |
// | 14  | x-coordinate of the fingertip of the pusher              | -Inf | Inf | tips_arm                         | slide    | position (m)             |
// | 15  | y-coordinate of the fingertip of the pusher              | -Inf | Inf | tips_arm                         | slide    | position (m)             |
// | 16  | z-coordinate of the fingertip of the pusher              | -Inf | Inf | tips_arm                         | slide    | position (m)             |
// | 17  | x-coordinate of the object to be moved                   | -Inf | Inf | object (obj_slidex)              | slide    | position (m)             |
// | 18  | y-coordinate of the object to be moved                   | -Inf | Inf | object (obj_slidey)              | slide    | position (m)             |
// | 19  | z-coordinate of the object to be moved                   | -Inf | Inf | object                           | cylinder | position (m)             |
// | 20  | x-coordinate of the goal position of the object          | -Inf | Inf | goal (goal_slidex)               | slide    | position (m)             |
// | 21  | y-coordinate of the goal position of the object          | -Inf | Inf | goal (goal_slidey)               | slide    | position (m)             |
// | 22  | z-coordinate of the goal position of the object          | -Inf | Inf | goal                             | sphere   | position (m)             |

export const obs_terms= [
    "Rotation of the panning the shoulder",
    "Rotation of the shoulder lifting joint",
    "Rotation of the shoulder rolling joint",
    "Rotation of hinge joint that flexed the elbow",
    "Rotation of hinge that rolls the forearm",
    "Rotation of flexing the wrist",
    "Rotation of rolling the wrist",
    "Rotational velocity of the panning the shoulder",
    "Rotational velocity of the shoulder lifting joint",
    "Rotational velocity of the shoulder rolling joint",
    "Rotational velocity of hinge joint that flexed the elbow",
    "Rotational velocity of hinge that rolls the forearm",
    "Rotational velocity of flexing the wrist",
    "Rotational velocity of rolling the wrist",
    "x-coordinate of the fingertip of the pusher",
    "y-coordinate of the fingertip of the pusher",
    "z-coordinate of the fingertip of the pusher",
    "x-coordinate of the object to be moved",
    "y-coordinate of the object to be moved",
    "z-coordinate of the object to be moved",
    "x-coordinate of the goal position of the object",
    "y-coordinate of the goal position of the object",
    "z-coordinate of the goal position of the object"
]
// action space
// | Num | Action                                                             | Control Min | Control Max | Name (in corresponding XML file) | Joint | Unit         |
// |-----|--------------------------------------------------------------------|-------------|-------------|----------------------------------|-------|--------------|
// | 0    | Rotation of the panning the shoulder                              | -2          | 2           | r_shoulder_pan_joint             | hinge | torque (N m) |
// | 1    | Rotation of the shoulder lifting joint                            | -2          | 2           | r_shoulder_lift_joint            | hinge | torque (N m) |
// | 2    | Rotation of the shoulder rolling joint                            | -2          | 2           | r_upper_arm_roll_joint           | hinge | torque (N m) |
// | 3    | Rotation of hinge joint that flexed the elbow                     | -2          | 2           | r_elbow_flex_joint               | hinge | torque (N m) |
// | 4    | Rotation of hinge that rolls the forearm                          | -2          | 2           | r_forearm_roll_joint             | hinge | torque (N m) |
// | 5    | Rotation of flexing the wrist                                     | -2          | 2           | r_wrist_flex_joint               | hinge | torque (N m) |
// | 6    | Rotation of rolling the wrist                                     | -2          | 2           | r_wrist_roll_joint               | hinge | torque (N m) |
export const action_terms= [
    "Rotation of the panning the shoulder",
    "Rotation of the shoulder lifting joint",
    "Rotation of the shoulder rolling joint",
    "Rotation of hinge joint that flexed the elbow",
    "Rotation of hinge that rolls the forearm",
    "Rotation of flexing the wrist",
    "Rotation of rolling the wrist"
]

export const env = "pusher"
