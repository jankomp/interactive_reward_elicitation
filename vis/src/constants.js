export const n_s= 11 // number of state feature
export const n_a= 2 // number of action feature
// Observation Space
// cosine of the angle of the first arm
//cosine of the angle of the second arm
//sine of the angle of the first arm
//sine of the angle of the second arm
//x-coordinate of the target
//y-coordinate of the target
//angular velocity of the first arm
//angular velocity of the second arm
//x-value of position_fingertip - position_target
//y-value of position_fingertip - position_target
//z-value of position_fingertip - position_target (constantly 0 since reacher is 2d and z is same for both)

export const obs_terms= [
    "cosine of the angle of the first arm",
    "cosine of the angle of the second arm",
    "sine of the angle of the first arm",
    "sine of the angle of the second arm",
    "x-coordinate of the target",
    "y-coordinate of the target",
    "angular velocity of the first arm",
    "angular velocity of the second arm",
    "x-value of position_fingertip - position_target",
    "y-value of position_fingertip - position_target",
    "z-value of position_fingertip - position_target"
]
// The first coordinate of an action determines the Torque applied at the first hinge (connecting the link to the point of fixture), while the second
// coordinate specifies the Torque applied at the second hinge (connecting the two links).
export const action_terms= [
    "Torque applied at the first hinge (connecting the link to the point of fixture)",
    "Torque applied at the second hinge (connecting the two links)"
]

export const env = "reacher"
