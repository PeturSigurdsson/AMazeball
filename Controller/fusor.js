import {
  Quaternion,
  Vector3,
  Vector4,
  Matrix4,
  Clock
} from 'three';

import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  DeviceMotion,
  Pedometer,
} from 'expo-sensors';

import AHRS from 'ahrs';
import KalmanFilter from 'kalmanjs';

const updateInterval = 4;

// Sensor clocks
const ac = new Clock();
const gc = new Clock();

const K = KalmanFilter;

// Kalman filters
// Gyro
const gx=new K(),gy=new K(),gz=new K();
// Accelerometer
const ax=new K(),ay=new K(),az=new K();
// Magnetometer
const mx=new K(),my=new K(),mz=new K();

const map = {
  0: 'x', 1: 'y', 2: 'z'
};

let accX = [], accY = [], accZ = [];
let count = 0, zero = new Vector3();

// Fuses sensor data
export default class Fusor{

  constructor(){

    // Ahrs filter to fuse sensor data
    this.imu = new AHRS({
      sampleInterval: updateInterval,
      algorithm: 'Madgwick',
      beta: 0.1,
    });

    // Sensor data
    // Magnetometer
    this.m = new Vector3();
    // Gyroscope
    this.g = new Vector3();
    // Acceleration
    this.a = new Vector3();

    this.orientation = new Quaternion(-1,0,0,1);

    /**
     * Magnetometer for ahrs (optional)
     */
    Magnetometer.isAvailableAsync().then(
      (available) => {
        if(available){
          Magnetometer.setUpdateInterval(
            updateInterval
          );

          Magnetometer.addListener(
            m => {
              this.m.set(
                mx.filter(m.x),
                my.filter(m.y),
                mz.filter(m.z)
              );
              magCheck = true;
            }
          );
        } else{
          console.warn(
            "No magnetometer available"
          );
        }
      }
    );

    /**
     * Use Accelerometer in ahrs
     */
    Accelerometer.isAvailableAsync().then(
      (available) => {
        if(available){
          Accelerometer.setUpdateInterval(
            updateInterval
          );
          Accelerometer.addListener(
            (a) => {
              let dt = ac.getDelta();
              this.a.set(
                ax.filter(a.x),
                ay.filter(a.y),
                az.filter(a.z)
              );
              this.a.multiplyScalar(dt);
              this.a.normalize();
            }
          );
        } else {
          console.warn("No accelerometer");
        }
      }
    );

    /**
     * Gyro calls ahrs
     */
    Gyroscope.isAvailableAsync().then(
      (available) => {
        if(available){
          Gyroscope.setUpdateInterval(
            updateInterval
          );

          Gyroscope.addListener(
            g => {
              let dt = gc.getDelta();
              this.g.set(
                gx.filter(g.x),
                gy.filter(g.y),
                gz.filter(g.z)
              );
              /* Magnetometers can be
               * available and crap at the
               * same time must implement
               * variance check.
               */
              if(true){
                this.m.set(
                  undefined,
                  undefined,
                  undefined
                );
              }
              this.imu.update(
                this.g.x, this.g.y, this.g.z,
                this.a.x, this.a.y, this.a.z,
                this.m.x, this.m.y, this.m.z,
                dt
              );
              this.g.multiplyScalar(dt);
              magCheck = false;
            }
          );
        } else {
          console.warn("No gyro");
        }
      }
    );
  }

  lowpass = (a,b,w) => {
    a *= (1 - w);
    b *= w;
    return a + b;
  };

  getMove = () => {
    return this.move;
  };

  getFusedOrientation = () => {
    let q = this.imu.getQuaternion();
    q = new Quaternion(q.x,q.y,q.z,q.w);

    q = new Quaternion(
      -0.707,0,0,0.707
    ).multiply(q);
    this.orientation = q;
    return q;
  };

  getRotationMatrix = (g, m) => {
    if(!g || !m) return null;
    let H = m.normalize().cross(
      g.normalize()
    );
    H.normalize();
    let G = g;
    let M = G.clone().cross(H);
    M.normalize();
    let res = new Matrix4();
    res.set(
      H.x,H.y,H.z,0,
      M.x,M.y,M.z,0,
      G.x,G.y,G.z,0,
      0  ,0  ,0  ,1
    );
    let yz = new Matrix4();
    yz.set(
      1, 0,0,0,
      0, 0,1,0,
      0,-1,0,0,
      0, 0,0,0
    );
    yz.multiply(res);
    return yz;
  };
}
