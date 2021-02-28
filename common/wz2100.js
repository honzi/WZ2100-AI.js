function attack(group, target, override){
    var droids = enumGroup(group);
    droids.some(function check_droid(droid){
        if(!override
          && droid.order !== 0
          && droid.order !== 25){
            return;
        }

        if(target.type === DROID){
            if(target.isVTOL){
                if(!droid.canHitAir){
                    return;
                }

            }else if(!droid.canHitGround){
                return;
            }
        }

        orderDroidLoc(
          droid,
          DORDER_SCOUT,
          target.x,
          target.y
        );
    });
}

function buildStructure(droid, structure, x, y, todo){
    x = x || droid.x;
    y = y || droid.y;

    var location = pickStructLocation(
      droid,
      structure,
      x + (Math.random() * 4 - 2),
      y + (Math.random() * 4 - 2)
    );

    if(location){
        orderDroidBuild(
          droid,
          DORDER_BUILD,
          structure,
          location.x,
          location.y,
          Math.floor(Math.random() * 4) * 90
        );

    }else if(todo !== undefined){
        todo(droid);
    }
}

function checkNeedModule(structure, module, count){
    if(!isStructureAvailable(
        module,
        me
      )){
        return false;
    }

    var moduleNeeded = false;
    var structures = enumStruct(
      me,
      structure
    );
    structures.some(function check_structure(checkedStructure){
        if(checkedStructure.modules >= count){
            return;
        }

        moduleNeeded = checkedStructure;
    });

    return moduleNeeded;
}

function checkStructure(structure, count){
    return structure !== undefined
      && isStructureAvailable(
        structure,
        me
      ) && countStruct(structure) < count;
}

function eventGameLoaded(){
    init();
}

function eventStartLevel(){
    init();
}

function randomLocation(droid){
    orderDroidLoc(
      droid,
      DORDER_MOVE,
      Math.floor(Math.random() * mapWidth),
      Math.floor(Math.random() * mapHeight)
    );
}
