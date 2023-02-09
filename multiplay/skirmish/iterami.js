function attack(group, target, override){
    const droids = enumGroup(group);
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

        }else if(target.type === STRUCTURE){
            if(target.stattype === WALL){
                orderDroidObj(
                  droid,
                  DORDER_ATTACK,
                  target
                );

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

function buildStructure(droid, structure, maxBlockingTiles, offset, x, y){
    offset = offset || 4;
    x = x || droid.x;
    y = y || droid.y;

    const coordinates = locationClamp(
      x + (Math.random() * offset - offset / 2),
      y + (Math.random() * offset - offset / 2)
    );
    const location = pickStructLocation(
      droid,
      structure,
      coordinates.x,
      coordinates.y,
      maxBlockingTiles
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
    }
}

function checkNeedModule(structure, module, count){
    if(!isStructureAvailable(
        module,
        me
      )){
        return false;
    }

    let moduleNeeded = false;
    const structures = enumStruct(
      me,
      structure
    );
    structures.some(function check_structure(checkedStructure){
        if(checkedStructure.modules < count){
            moduleNeeded = checkedStructure;
        }
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

function enumStructByType(player, types, visibility){
    let structures = [];

    for(let type in types){
        structures = structures.concat(enumStruct(
          player,
          types[type],
          visibility
        ));
    }

    return structures;
}

function eventGameLoaded(){
    preInit();
}

function eventPickup(feature, droid){
    if(droid.player === me){
        orderDroid(
          droid,
          DORDER_RTB
        );
    }
}

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    const bodyResearch = {
      'R-Vehicle-Body02': 'Body2SUP',
      'R-Vehicle-Body03': 'Body3MBT',
      'R-Vehicle-Body04': 'Body4ABT',
      'R-Vehicle-Body05': 'Body5REC',
      'R-Vehicle-Body06': 'Body6SUPP',
      'R-Vehicle-Body07': 'Body7ABT',
      'R-Vehicle-Body08': 'Body8MBT',
      'R-Vehicle-Body09': 'Body9REC',
      'R-Vehicle-Body10': 'Body10MBT',
      'R-Vehicle-Body11': 'Body11ABT',
      'R-Vehicle-Body12': 'Body12SUP',
      'R-Vehicle-Body13': 'Body13SUP',
      'R-Vehicle-Body14': 'Body14SUP',
    };
    if(bodyResearch[research.name]){
        bodies.push(bodyResearch[research.name]);
    }

    const cyborgWeaponResearch = {
      'R-Wpn-Cannon1Mk1': 'CyborgCannon',
      'R-Wpn-Flamer01Mk1': 'CyborgFlamer01',
      'R-Wpn-Laser01': 'Cyb-Wpn-Laser',
      'R-Wpn-MG1Mk1': 'CyborgChaingun',
      'R-Wpn-MG4': 'CyborgRotMG',
      'R-Wpn-Missile2A-T': 'Cyb-Wpn-Atmiss',
      'R-Wpn-Mortar01Lt': 'Cyb-Wpn-Grenade',
      'R-Wpn-RailGun01': 'Cyb-Wpn-Rail1',
      'R-Wpn-Rocket01-LtAT': 'CyborgRocket',
    };
    if(cyborgWeaponResearch[research.name]){
        cyborgWeapons.push(cyborgWeaponResearch[research.name]);
    }

    const defenseStructureResearch = {
      'R-Defense-Emplacement-HPVcannon': 'Emplacement-HPVcannon',
      'R-Defense-PrisLas': 'Emplacement-PrisLas',
      'R-Defense-PulseLas': 'GuardTower-BeamLas',
      'R-Defense-Super-Missile': 'X-Super-Missile',
      'R-Defense-Tower01': 'GuardTower1',
      'R-Defense-Tower06': 'GuardTower6',
      'R-Defense-Wall-RotMg': 'Wall-RotMg',
      'R-Defense-WallTower-HPVcannon': 'WallTower-HPVcannon',
      'R-Defense-WallTower-PulseLas': 'WallTower-PulseLas',
      'R-Defense-WallTower-TwinAGun': 'WallTower-TwinAssaultGun',
      'R-Defense-WallTower01': 'WallTower01',
    };
    if(defenseStructureResearch[research.name]){
        defenseStructures.push(defenseStructureResearch[research.name]);
    }

    const droidWeaponResearch = {
      'R-Wpn-Cannon1Mk1': 'Cannon1Mk1',
      'R-Wpn-Cannon2Mk1': 'Cannon2A-TMk1',
      'R-Wpn-Cannon3Mk1': 'Cannon375mmMk1',
      'R-Wpn-Cannon4AMk1': 'Cannon4AUTOMk1',
      'R-Wpn-Cannon5': 'Cannon5VulcanMk1',
      'R-Wpn-Cannon6TwinAslt': 'Cannon6TwinAslt',
      'R-Wpn-EMPCannon': 'EMP-Cannon',
      'R-Wpn-Flame2': 'Flame2',
      'R-Wpn-Flamer01Mk1': 'Flame1Mk1',
      'R-Wpn-Howitzer-Incendiary': 'Howitzer-Incendiary',
      'R-Wpn-Howitzer03-Rot': 'Howitzer03-Rot',
      'R-Wpn-HowitzerMk1': 'Howitzer105Mk1',
      'R-Wpn-HvArtMissile': 'Missile-HvyArt',
      'R-Wpn-HvyHowitzer': 'Howitzer150Mk1',
      'R-Wpn-HvyLaser': 'HeavyLaser',
      'R-Wpn-Laser01': 'Laser3BEAMMk1',
      'R-Wpn-Laser02': 'Laser2PULSEMk1',
      'R-Wpn-MG1Mk1': 'MG1Mk1',
      'R-Wpn-MG2Mk1': 'MG2Mk1',
      'R-Wpn-MG3Mk1': 'MG3Mk1',
      'R-Wpn-MG4': 'MG4ROTARYMk1',
      'R-Wpn-MG5': 'MG5TWINROTARY',
      'R-Wpn-MdArtMissile': 'Missile-MdArt',
      'R-Wpn-Missile2A-T': 'Missile-A-T',
      'R-Wpn-MortarEMP': 'MortarEMP',
      'R-Wpn-Mortar-Incendiary': 'Mortar-Incendiary',
      'R-Wpn-Mortar01Lt': 'Mortar1Mk1',
      'R-Wpn-Mortar02Hvy': 'Mortar2Mk1',
      'R-Wpn-Mortar3': 'Mortar3ROTARYMk1',
      'R-Wpn-PlasmaCannon': 'Laser4-PlasmaCannon',
      'R-Wpn-Plasmite-Flamer': 'PlasmiteFlamer',
      'R-Wpn-RailGun01': 'RailGun1Mk1',
      'R-Wpn-RailGun02': 'RailGun2Mk1',
      'R-Wpn-RailGun03': 'RailGun3Mk1',
      'R-Wpn-Rocket01-LtAT': 'Rocket-LtA-T',
      'R-Wpn-Rocket02-MRL': 'Rocket-MRL',
      'R-Wpn-Rocket03-HvAT': 'Rocket-BB',
      'R-Wpn-Rocket05-MiniPod': 'Rocket-Pod',
      'R-Wpn-Rocket06-IDF': 'Rocket-IDF',
      'R-Wpn-Rocket07-Tank-Killer': 'Rocket-HvyA-T',
    };
    if(droidWeaponResearch[research.name]){
        droidWeapons.push(droidWeaponResearch[research.name]);
    }

    const propulsionResearch = {
      'R-Vehicle-Prop-Halftracks': 'HalfTrack',
      'R-Vehicle-Prop-Hover': 'hover01',
      'R-Vehicle-Prop-Tracks': 'tracked01',
    };
    if(propulsionResearch[research.name]){
        propulsion.push(propulsionResearch[research.name]);

        if(research.name === 'R-Vehicle-Prop-Hover'){
            propulsionHover = true;
        }
    }
}

function eventStartLevel(){
    preInit();
}

function eventStructureBuilt(structure, droid){
    perMinute();
}

function locationClamp(x, y){
    return {
      'x': Math.max(
        Math.min(
          x,
          mapWidth
        ),
        0
      ),
      'y': Math.max(
        Math.min(
          y,
          mapHeight
        ),
        0
      ),
    };
}

function perMinuteStart(){
    removeTimer('perMinuteStart');
    setTimer(
      'perMinute',
      60000
    );
}

function preInit(){
    maxCyborgFactories = getStructureLimit(
      'A0CyborgFactory',
      me
    );
    maxFactories = getStructureLimit(
      'A0LightFactory',
      me
    );
    maxResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );

    init();
}

function randomConstructionDroid(factory){
    const droidBody = bodies[Math.floor(Math.random() * bodies.length)];
    const droidPropulsion = propulsionHover
      ? 'hover01'
      : propulsion[Math.floor(Math.random() * propulsion.length)];
    const droidWeapon1 = droidBody === 'Body14SUP'
      ? 'SensorTurret1Mk1'
      : undefined;

    buildDroid(
      factory,
      'drone-' + droidBody + '-' + droidPropulsion + '-Spade1Mk1'
        + (droidWeapon1 !== undefined ? '+' + droidWeapon1 : ''),
      droidBody,
      droidPropulsion,
      '',
      DROID_CONSTRUCT,
      'Spade1Mk1',
      droidWeapon1
    );
}

function randomCyborg(cyborgFactory){
    const cyborgWeapon = cyborgWeapons[Math.floor(Math.random() * cyborgWeapons.length)];

    buildDroid(
      cyborgFactory,
      'cyborg-CyborgLightBody-CyborgLegs-' + cyborgWeapon,
      'CyborgLightBody',
      'CyborgLegs',
      '',
      DROID_CYBORG,
      cyborgWeapon
    );
}

function randomLocation(group, order){
    const droids = enumGroup(group);
    droids.some(function check_droid(droid){
        orderDroidLoc(
          droid,
          order,
          Math.floor(Math.random() * mapWidth),
          Math.floor(Math.random() * mapHeight)
        );
    });
}

function randomResearch(researchFacility, availableResearch){
    startResearch(
      researchFacility,
      availableResearch[Math.floor(Math.random() * availableResearch.length)].name
    );
}

function randomWeaponDroid(factory){
    const droidBody = bodies[Math.floor(Math.random() * bodies.length)];
    const droidPropulsion = propulsion[Math.floor(Math.random() * propulsion.length)];
    const droidWeapon0 = droidWeapons[Math.floor(Math.random() * droidWeapons.length)];
    const droidWeapon1 = droidBody === 'Body14SUP'
      ? droidWeapons[Math.floor(Math.random() * droidWeapons.length)]
      : undefined;

    buildDroid(
      factory,
      'droid-' + droidBody + '-' + droidPropulsion + '-' + droidWeapon0
        + (droidWeapon1 !== undefined ? '+' + droidWeapon1 : ''),
      droidBody,
      droidPropulsion,
      '',
      DROID_WEAPON,
      droidWeapon0,
      droidWeapon1
    );
}

const bodies = ['Body1REC'];
const cyborgWeapons = [];
const defenseStructures = [];
const droidWeapons = [];
const propulsion = ['wheeled01'];
let maxCyborgFactories = 5;
let maxFactories = 5;
let maxPowerGenerators = 1;
let maxResearchFacilities = 5;
let propulsionHover = false;
let resourceExtractorCount = 0;
