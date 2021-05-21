import {Clock, Quaternion, Vector3} from "three";

/* Right now it's numbers but could be f() */
const fireTypes = {
  single: 0, burst: 1, auto: 2, buck: 3, lazer: 4
};

const gunTypes = {
  handgun: {
    fireType: [fireTypes.single,fireTypes.burst],
    muzzleVel: { min: 10, max: 40 },
    numBullets: {min: 1, max: 1}
    accuracy: {min: 0, max: 2},
    weight: {min: 4, max: 20},
    fireRate: {min: 0, max:0.5}
  },
  shotgun: {
    fireType: [fireTypes.single, fireTypes.auto],
    muzzleVel: {min: 10, max: 60},
    numBullets: {min: 1, max: 10},
    accuracy: {min: 0, max: 10},
    weight: {min: 15, max: 100},
    fireRate: {min: 0.1, max: 0.7}
  },
  assault: 2,
  smg: 3,
  lmg: 4,
  lazer: 5
};

class GunType{
  constructor(props){
    for(let p in props) this[p] = props[p];
  }

  /* Types of firing behaviors */
  fireType = [];
  /* Exit velocity range  */
  muzzleVel = {min:0,max:1};
  /* Bullets shot for each fire call */
  numBullets = {min:1, max:1};
  /* Degrees randomness */
  accuracy = {min: 0, max: 1};
  /* Bullet weight range */
  weight = {min: 0, max: 1};
  /* Firing rate wait time to next shot */
  fireRate = {min: 0, max: 1};
  /* TODO: Enable elemental damage on enemies */
  elemental = {}
}

class Gun extends MeshedEntity{
  constructor(props){
    super(props);
    this.clock = new Clock();

    /* Gun properties create a unique
     * experience for each gun.
     */
    this.fireRate = props.fireRate;
    this.muzzleVel = props.muzzleVel;
    this.bulletBounces = props.bulletBounces;
    this.bulletWeight = props.bulletWeight;
    this.bulletBounces = props.bulletBounces;

    this.bulletMaterial = props.bulletMaterial;
    this.bulletPhysMat = props.
      bulletPhysicsMaterial
  }

  fire(){
    let dt = clock.getDelta();
    if(dt >= this.fireRate){
      this.createBullet();
    }
  }

  directBullet = () => {
    let offset = new Vector3(0,0,-1);
    offset.applyQuaternion(
      this.orientation
    );

    let o = new Quaternion().copy(
      this.orientation
    ).multiply(
      new Quaternion().setFromAxisAngle(
        new Vector3(1,0,0), Math.PI / 12
      )
    );
    return [
      this.position.clone().add(
        offset
      ),
      new Quaternion().copy(o),
      50,
      20
    ];
  };

  createBullet = () => {

    let [pos, or] = this.directBullet();

    for(let i = 0; i < this.numBullets; i++){
      let spread = new Quaternion().
        setFromAxisAngle(
          new Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            0
          ),
          Math.random() * this.accuracy *
          (Math.PI / 180)
        );
      const bullet = new Bullet({
        position: pos,
        orientation: or,
        material: this.bulletMaterial,
        physicsMaterial: this.bulletPhysMat,
        muzzleVel: this.muzzleVel,
        mass: this.bulletWeight,
        bounces: this.bulletBounces,
      });
    }
  };
}
