import { GridBroadphase, Shape } from "cannon";

class Grid extends GridBroadphase {
  constructor(props){
    super(props);
  }

  collisionPairs = (world,pairs1,pairs2) =>{
    let N = world.numObjects(),
      bodies = world.bodies;

    let max = this.aabbMax,
      min = this.aabbMin,
      nx = this.nx,
      ny = this.ny,
      nz = this.nz;

    let xstep = ny*nz;
    let ystep = nz;
    let zstep = 1;

    let xmax = max.x,
      ymax = max.y,
      zmax = max.z,
      xmin = min.x,
      ymin = min.y,
      zmin = min.z;

    let xmult = nx / (xmax-xmin),
      ymult = ny / (ymax-ymin),
      zmult = nz / (zmax-zmin);

    let binsizeX = (xmax - xmin) / nx,
      binsizeY = (ymax - ymin) / ny,
      binsizeZ = (zmax - zmin) / nz;

    let binRadius = Math.sqrt(binsizeX*binsizeX + binsizeY*binsizeY + binsizeZ*binsizeZ) * 0.5;

    let types = Shape.types;
    let SPHERE =            types.SPHERE,
      PLANE =             types.PLANE,
      BOX =               types.BOX,
      COMPOUND =          types.COMPOUND,
      CONVEXPOLYHEDRON =  types.CONVEXPOLYHEDRON;

    let bins=this.bins,
      binLengths=this.binLengths,
      Nbins=this.bins.length;

    // Reset bins
    for(let i=0; i!==Nbins; i++){
      binLengths[i] = 0;
    }

    let ceil = Math.ceil;
     min = Math.min;
     max = Math.max;

    function addBoxToBins(x0,y0,z0,x1,y1,z1,bi) {
      let xoff0 = ((x0 - xmin) * xmult)|0,
        yoff0 = ((y0 - ymin) * ymult)|0,
        zoff0 = ((z0 - zmin) * zmult)|0,
        xoff1 = ceil((x1 - xmin) * xmult),
        yoff1 = ceil((y1 - ymin) * ymult),
        zoff1 = ceil((z1 - zmin) * zmult);

      if (xoff0 < 0) { xoff0 = 0; } else if (xoff0 >= nx) { xoff0 = nx - 1; }
      if (yoff0 < 0) { yoff0 = 0; } else if (yoff0 >= ny) { yoff0 = ny - 1; }
      if (zoff0 < 0) { zoff0 = 0; } else if (zoff0 >= nz) { zoff0 = nz - 1; }
      if (xoff1 < 0) { xoff1 = 0; } else if (xoff1 >= nx) { xoff1 = nx - 1; }
      if (yoff1 < 0) { yoff1 = 0; } else if (yoff1 >= ny) { yoff1 = ny - 1; }
      if (zoff1 < 0) { zoff1 = 0; } else if (zoff1 >= nz) { zoff1 = nz - 1; }

      xoff0 *= xstep;
      yoff0 *= ystep;
      zoff0 *= zstep;
      xoff1 *= xstep;
      yoff1 *= ystep;
      zoff1 *= zstep;

      for (let xoff = xoff0; xoff <= xoff1; xoff += xstep) {
        for (let yoff = yoff0; yoff <= yoff1; yoff += ystep) {
          for (let zoff = zoff0; zoff <= zoff1; zoff += zstep) {
            let idx = xoff+yoff+zoff;
            bins[idx][binLengths[idx]++] = bi;
          }
        }
      }
    }

    // Put all bodies into the bins
    for(let i=0; i!==N; i++){
      let bi = bodies[i];
      let si = bi.shape;

      if(si === undefined){

        if (bi.aabbNeedsUpdate) {
          bi.computeAABB();
        }

        addBoxToBins(
          bi.aabb.lowerBound.x,
          bi.aabb.lowerBound.y,
          bi.aabb.lowerBound.z,
          bi.aabb.upperBound.x,
          bi.aabb.upperBound.y,
          bi.aabb.upperBound.z,
          bi);

        continue;
      }

      switch(si.type){
        case SPHERE:
          // Put in bin
          // check if overlap
          // with other bins

          let x = bi.position.x,
            y = bi.position.y,
            z = bi.position.z;
          let r = si.radius;

          addBoxToBins(
            x-r, y-r, z-r, x+r,
            y+r, z+r, bi
          );
          break;

        case PLANE:
          if(si.worldNormalNeedsUpdate){
            si.computeWorldNormal(
              bi.quaternion
            );
          }
          let planeNormal = si.worldNormal;

          //Relative position from origin
          //of plane object to the first
          //bin Incremented as we iterate
          //through the bins
          let xreset = xmin + binsizeX *
            0.5 - bi.position.x,
            yreset = ymin + binsizeY *
            0.5 - bi.position.y,
            zreset = zmin + binsizeZ *
            0.5 - bi.position.z;

          let d = GridBroadphase_collisionPairs_d;
          d.set(xreset, yreset, zreset);

          for (
            let xi = 0, xoff = 0;
            xi !== nx;
            xi++, xoff += xstep,
            d.y = yreset, d.x += binsizeX
          ) {
            for (
              let yi = 0, yoff = 0;
              yi !== ny;
              yi++, yoff += ystep,
              d.z = zreset, d.y += binsizeY
            ) {
              for (
                let zi = 0, zoff = 0;
                zi !== nz; zi++,
                zoff += zstep,
                d.z += binsizeZ
              ) {
                if (
                  d.dot(
                    planeNormal
                  ) < binRadius
                ) {
                  let idx = xoff + yoff +
                    zoff;
                  bins[idx][
                    binLengths[idx]++
                  ] = bi;
                }
              }
            }
          }
          break;

        default:
          if (bi.aabbNeedsUpdate) {
            bi.computeAABB();
          }

          addBoxToBins(
            bi.aabb.lowerBound.x,
            bi.aabb.lowerBound.y,
            bi.aabb.lowerBound.z,
            bi.aabb.upperBound.x,
            bi.aabb.upperBound.y,
            bi.aabb.upperBound.z,
            bi);
          break;
      }
    }


  // Check each bin
  for (let i=0; i!==Nbins; i++){
    let binLength = binLengths[i];
    //Skip bins with no potential collisions
    if (binLength > 1) {
      let bin = bins[i];

      // Do N^2 broadphase inside
      for(let xi=0; xi!==binLength; xi++){
        let bi = bin[xi];
        for(let yi=0; yi!==xi; yi++){
          let bj = bin[yi];
          if(this.needBroadphaseCollision(bi,bj)){
            this.intersectionTest(bi,bj,pairs1,pairs2);
          }
        }
      }
    }
  }
  }
}

export default Grid;
