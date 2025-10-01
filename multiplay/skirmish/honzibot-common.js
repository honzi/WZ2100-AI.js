'use strict';

function attack(group, target, override){
    enumGroup(group).some(function check_droid(droid){
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

function attackEnemies(){
    if(groupSize(groupAttack) < minAttack){
        return;
    }

    let attacking = false;
    playerData.forEach(function(player, id){
        if(attacking
          || allianceExistsBetween(me, id)){
            return;
        }

        if(groupSize(groupAttack) >= minAttackStructures){
            const structures = enumStructByType(
              id,
              [
                DEFENSE,
                FACTORY,
                CYBORG_FACTORY,
                VTOL_FACTORY,
                RESOURCE_EXTRACTOR,
                RESEARCH_LAB,
                SAT_UPLINK,
                LASSAT,
                POWER_GEN,
                HQ,
                REPAIR_FACILITY,
                COMMAND_CONTROL,
              ]
            );
            if(structures.length > 0){
                attack(
                  groupAttack,
                  structures[structures.length - 1],
                  true
                );
                attacking = true;
                return;
            }

            const others = enumStructByType(
              id,
              [
                REARM_PAD,
                WALL,
                GATE,
              ]
            );
            if(others.length > 0){
                attack(
                  groupAttack,
                  others[others.length - 1],
                  true
                );
                attacking = true;
                return;
            }
        }

        const droids = enumDroid(id, DROID_ANY, me);
        if(droids.length > 0){
            attack(
              groupAttack,
              droids[droids.length - 1],
              true
            );
            attacking = true;
            return;
        }
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

function checkAllModules(droid){
    const powerModuleNeeded = checkNeedModule('A0PowerGenerator', 'A0PowMod1', 1);
    if(powerModuleNeeded !== false){
        buildStructure(
          droid,
          'A0PowMod1',
          -1,
          0,
          powerModuleNeeded.x,
          powerModuleNeeded.y
        );
        return true;
    }
    const factoryModuleNeeded = checkNeedModule('A0LightFactory', 'A0FacMod1', 2);
    if(factoryModuleNeeded !== false){
        buildStructure(
          droid,
          'A0FacMod1',
          -1,
          0,
          factoryModuleNeeded.x,
          factoryModuleNeeded.y
        );
        return true;
    }
    const researchModuleNeeded = checkNeedModule('A0ResearchFacility', 'A0ResearchModule1', 1);
    if(researchModuleNeeded !== false){
        buildStructure(
          droid,
          'A0ResearchModule1',
          -1,
          0,
          researchModuleNeeded.x,
          researchModuleNeeded.y
        );
        return true;
    }

    return false;
}

function checkNeedModule(structure, module, count){
    if(!isStructureAvailable(module, me)){
        return false;
    }

    let moduleNeeded = false;
    enumStruct(me, structure).some(function check_structure(checkedStructure){
        if(checkedStructure.modules < count){
            moduleNeeded = checkedStructure;
        }
    });

    return moduleNeeded;
}

function defend(victim, attacker){
    if(victim.player !== me){
        return;
    }

    if(victim.group === groupAttack){
        attack(
          groupAttack,
          attacker,
          false
        );

    }else if(victim.type === STRUCTURE
      || (victim.group === groupDefend && groupSize(groupDefend) > maxDefend / 2)){
        attack(
          groupDefend,
          attacker,
          true
        );
    }
}

function defendTransfer(gameObject, from){
    if(gameObject.player === me
      && gameObject.type === DROID){
        groupAddDroid(
          groupDefend,
          gameObject
        );
    }
}

function droidBuilt(droid, structure){
    if(droid.droidType === DROID_CONSTRUCT){
        return;
    }

    if(groupSize(groupScout) < maxScout){
        groupAddDroid(
          groupScout,
          droid
        );
        return;
    }

    groupAddDroid(
      groupDefend,
      droid
    );

    if(groupSize(groupDefend) > maxDefend){
        groupAddDroid(
          groupAttack,
          random(enumGroup(groupDefend))
        );
    }
}

function enumStructByType(player, types){
    const structures = [];

    for(const type in types){
        structures.push(...enumStruct(
          player,
          types[type],
          me
        ));
    }

    return structures;
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
	return;
    }

    const defenseStructureResearch = {
      'R-Defense-Emplacement-HPVcannon': 'Emplacement-HPVcannon',
      'R-Defense-PrisLas': 'Emplacement-PrisLas',
      'R-Defense-PulseLas': 'GuardTower-BeamLas',
      'R-Defense-Super-Missile': 'X-Super-Missile',
      'R-Defense-Tower06': 'GuardTower6',
      'R-Defense-Wall-RotMg': 'Wall-RotMg',
      'R-Defense-WallTower-HPVcannon': 'WallTower-HPVcannon',
      'R-Defense-WallTower-PulseLas': 'WallTower-PulseLas',
      'R-Defense-WallTower-TwinAGun': 'WallTower-TwinAssaultGun',
      'R-Defense-WallTower01': 'WallTower01',
    };
    if(defenseStructureResearch[research.name]){
        defenseStructures.push(defenseStructureResearch[research.name]);
	return;
    }

    const propulsionResearch = {
      'R-Vehicle-Prop-Halftracks': 'HalfTrack',
      'R-Vehicle-Prop-Hover': 'hover01',
      'R-Vehicle-Prop-Tracks': 'tracked01',
    };
    if(propulsionResearch[research.name]){
        if(research.name === 'R-Vehicle-Prop-Hover'){
            propulsionHover = true;
        }

        propulsion.push(propulsionResearch[research.name]);
	return;
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
      'R-Wpn-ParticleGun': 'ParticleGun',
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
        if(research.name === 'R-Wpn-MG5'){
            removeTech(['MG1Mk1', 'MG2Mk1', 'MG3Mk1', 'MG4ROTARYMk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-MG4'){
            removeTech(['MG1Mk1', 'MG2Mk1', 'MG3Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-MG3Mk1'){
            removeTech(['MG1Mk1', 'MG2Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-MG2Mk1'){
            removeTech(['MG1Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-Cannon3Mk1'){
            removeTech(['Cannon1Mk1', 'Cannon2A-TMk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-Cannon2Mk1'){
            removeTech(['Cannon1Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-Howitzer03-Rot'){
            removeTech(['Howitzer105Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-Mortar3'){
            removeTech(['Mortar1Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-RailGun03'){
            removeTech(['RailGun1Mk1', 'RailGun2Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-RailGun02'){
            removeTech(['RailGun1Mk1'], droidWeapons);

        }else if(research.name === 'R-Wpn-Plasmite-Flamer'){
            removeTech(['Flame1Mk1, Flame2'], droidWeapons);

        }else if(research.name === 'R-Wpn-Flame2'){
            removeTech(['Flame1Mk1'], droidWeapons);
        }

        droidWeapons.push(droidWeaponResearch[research.name]);
    }

    const cyborgWeaponResearch = {
      'R-Wpn-Cannon1Mk1': 'CyborgCannon',
      'R-Wpn-Flame2': 'Cyb-Wpn-Thermite',
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
        if(research.name === 'R-Wpn-Flame2'){
            removeTech(['CyborgFlamer01'], cyborgWeapons);
        }

        cyborgWeapons.push(cyborgWeaponResearch[research.name]);
    }
}

function handleCollector(droid){
    if(droid.order === DORDER_BUILD){
        return true;
    }

    const features = enumFeature(me);
    for(let i = features.length - 1; i >= 0; i--){
        if(features[i].stattype === OIL_RESOURCE){
            buildStructure(
              droid,
              'A0ResourceExtractor',
              -1,
              0,
              features[i].x,
              features[i].y
            );
            return true;
        }
    }

    if(droid.order === DORDER_RECOVER){
        return true;
    }

    for(let i = features.length - 1; i >= 0; i--){
        const stattype = features[i].stattype;

        if(stattype === ARTIFACT){
            orderDroidObj(
              droid,
              DORDER_RECOVER,
              features[i]
            );
            return true;

        }else if(stattype === OIL_DRUM){
            orderDroidObj(
              droid,
              DORDER_RECOVER,
              features[i]
            );
            return true;
        }
    }

    return false;
}

function handleDroids(droids){
    let damagedHealth = 100;
    let damagedStructure = false;
    const structures = enumStruct(me);
    let unfinishedStructure = false;
    for(const structure in structures){
        if(structures[structure].status !== BUILT){
            unfinishedStructure = structures[structure];

        }else if(structures[structure].health < damagedHealth){
            damagedHealth = structures[structure].health;
            damagedStructure = structures[structure];
        }
    }

    droids.some(function check_droid(droid, index){
        const isProjectManager = index === droids.length - 1;
        const isCollector = index === droids.length - 2;

        if(isCollector){
            if(handleCollector(droid)){
                return;
            }

        }else if(damagedStructure !== false
          && index <= droids.length / 2 - 1){
            if(droid.order !== DORDER_REPAIR){
                orderDroidObj(
                  droid,
                  DORDER_REPAIR,
                  damagedStructure
                );
            }

            return;
        }

        if(droid.order === DORDER_BUILD
          || droid.order === DORDER_HELPBUILD){
            return;
        }

        if(unfinishedStructure !== false){
            orderDroidObj(
              droid,
              DORDER_HELPBUILD,
              unfinishedStructure
            );

            return;
        }

        if(!isProjectManager){
            return;
        }

        if(checkAllModules(droid)){
            return;
        }

        droidConstruct(droid);
    });
}

function handleResearch(target){
    if(enumResearch().length === 0){
        maxConstructionDroids = 7;
        maxResearchFacilities = 1;

    }else{
        const random = researchRandom || playerPower(me) > maxPowerReserve;

        enumStruct(me, 'A0ResearchFacility').some(function check_researchFacility(researchFacility){
            if(researchFacility.status !== BUILT
              || !structureIdle(researchFacility)){
                return;
            }

            if(random){
                if(playerPower(me) > maxPowerResearchAll){
                    randomResearch(researchFacility);

                }else{
                    randomAvailableResearch(
                      researchFacility,
                      enumResearch().filter(function(value){
                          return !researchExcluded.includes(value.name);
                      })
                    );
                }

            }else{
                const targetResearch = getResearch(target);

                if(targetResearch.done
                  || targetResearch.started){
                    productionBegin = true;
                    researchRandom = true;
                }

                pursueResearch(
                  researchFacility,
                  researchOrder
                );
            }
        });
    }
}

function init(){
    maxCyborgFactories = getStructureLimit('A0CyborgFactory', me);
    maxFactories = getStructureLimit('A0LightFactory', me);
    maxResearchFacilities = getStructureLimit('A0ResearchFacility', me);

    perSecond();
    setTimer(
      'perSecond',
      1000
    );
    setTimer(
      'perMinuteStart',
      me * 1000
    );
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

function minuteDroid(){
    maxPowerGenerators = Math.min(
      1 + Math.ceil(enumStruct(me, RESOURCE_EXTRACTOR).length / 4),
      getStructureLimit('A0PowerGenerator', me)
    );

    if(groupSize(groupScout) > 0){
        randomLocation(
          groupScout,
          DORDER_MOVE
        );
    }
    if(groupSize(groupAttack) >= minAttackStructures){
        randomLocation(
          groupAttack,
          DORDER_SCOUT
        );
    }

    const structures = enumStruct(me);
    const constructionDroidCount = countDroid(me, DROID_CONSTRUCT);
    let constructionDroidIndex = 0;

    enumDroid(me).some(function check_droid(droid, index){
        if(droid.droidType === DROID_CONSTRUCT){
            if(constructionDroidIndex++ === constructionDroidCount - 1
              && droid.order === DORDER_BUILD){
                return;
            }

        }else if(droid.group !== groupDefend){
            return;
        }

        const randomStructure = random(structures);
        if(randomStructure !== undefined){
            orderDroidLoc(
              droid,
              DORDER_SCOUT,
              randomStructure.x,
              randomStructure.y
            );
        }
    });
}

function perMinuteStart(){
    removeTimer('perMinuteStart');
    setTimer(
      'perMinute',
      60000
    );
}

function random(array){
    return array[Math.floor(Math.random() * array.length)];
}

function randomAvailableResearch(researchFacility, availableResearch){
    if(availableResearch.length === 0){
        return;
    }
    pursueResearch(
      researchFacility,
      random(availableResearch).name
    );
}

function randomConstructionDroids(droids){
    if(droids.length >= maxConstructionDroids){
        return false;
    }

    enumStruct(me, 'A0LightFactory').some(function check_factory(factory){
        if(factory.status !== BUILT
          || !structureIdle(factory)){
            return;
        }

        const droidBody = random(bodies);
        const droidPropulsion = propulsionHover
          ? 'hover01'
          : random(propulsion);
        const droidWeapon1 = droidBody === 'Body14SUP'
          ? 'SensorTurret1Mk1'
          : undefined;

        buildDroid(
          factory,
          'drone_' + droidBody + '_' + droidPropulsion + '_Spade1Mk1'
            + (droidWeapon1 !== undefined ? '+' + droidWeapon1 : ''),
          droidBody,
          droidPropulsion,
          '',
          DROID_CONSTRUCT,
          'Spade1Mk1',
          droidWeapon1
        );
    });

    return true;
}

function randomCyborgs(cyborgFactory){
    if(!(productionBegin
      || playerPower(me) > maxPowerReserve
      || groupSize(groupDefend) < maxDefend)){
        return;
    }

    enumStruct(me, 'A0CyborgFactory').some(function check_cyborgFactory(cyborgFactory){
        if(cyborgFactory.status !== BUILT
          || !structureIdle(cyborgFactory)
          || cyborgWeapons.length === 0){
            return;
        }

        const cyborgWeapon = random(cyborgWeapons);

        buildDroid(
          cyborgFactory,
          'cyborg_CyborgLightBody_CyborgLegs_' + cyborgWeapon,
          'CyborgLightBody',
          'CyborgLegs',
          '',
          DROID_CYBORG,
          cyborgWeapon
        );
    });
}

function randomLocation(group, order){
    enumGroup(group).some(function check_droid(droid){
        orderDroidLoc(
          droid,
          order,
          Math.floor(Math.random() * mapWidth),
          Math.floor(Math.random() * mapHeight)
        );
    });
}

function randomResearch(researchFacility){
    pursueResearch(
      researchFacility,
      random(enumResearch()).name
    );
}

function randomWeaponDroids(){
    if(!(productionBegin
      || playerPower(me) > maxPowerReserve
      || groupSize(groupDefend) < maxDefend)){
        return;
    }

    enumStruct(me, 'A0LightFactory').some(function check_factory(factory){
        if(factory.status !== BUILT
          || !structureIdle(factory)
          || droidWeapons.length === 0){
            return;
        }

        const droidBody = random(bodies);
        const droidPropulsion = random(propulsion);
        const droidWeapon0 = random(droidWeapons);
        const droidWeapon1 = droidBody === 'Body14SUP'
          ? random(droidWeapons)
          : undefined;

        buildDroid(
          factory,
          'droid_' + droidBody + '_' + droidPropulsion + '_' + droidWeapon0
            + (droidWeapon1 !== undefined ? '+' + droidWeapon1 : ''),
          droidBody,
          droidPropulsion,
          '',
          DROID_WEAPON,
          droidWeapon0,
          droidWeapon1
        );
    });
}

function removeTech(tech, from){
    for(const id in tech){
        const index = from.indexOf(tech[id]);
        if(index > -1){
            from.splice(index, 1);
        }
    }
}

const bodies = ['Body1REC'];
const cyborgWeapons = [];
const defenseStructures = [];
const droidWeapons = [];
const groupAttack = newGroup();
const groupDefend = newGroup();
const groupScout = newGroup();
const propulsion = ['wheeled01'];
let maxConstructionDroids = 4;
let maxCyborgFactories = 5;
let maxDefend = 25;
let maxFactories = 5;
let maxPowerGenerators = 1;
let maxPowerResearchAll = 100000;
let maxPowerReserve = 1000;
let maxResearchFacilities = 5;
let maxScout = 1;
let minAttack = 10;
let minAttackStructures = 40;
let productionBegin = false;
let propulsionHover = false;
let researchRandom = false;

globalThis.eventGameLoaded = init;
globalThis.eventStartLevel = init;
