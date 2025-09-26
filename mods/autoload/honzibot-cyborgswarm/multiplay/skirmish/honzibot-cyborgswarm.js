'use strict';
include('honzibot-common.js');

function droidConstruct(droid){
    const countPowerGenerator = countStruct('A0PowerGenerator');
    const countLightFactory = countStruct('A0LightFactory');
    const countResearchFacility = countStruct('A0ResearchFacility');

    if(countStruct('A0ResourceExtractor') === 0){
        buildStructure(droid, 'A0ResourceExtractor', -1);

    }else if(countPowerGenerator === 0){
        buildStructure(droid, 'A0PowerGenerator', 1);

    }else if(countLightFactory === 0){
        buildStructure(droid, 'A0LightFactory', 1);

    }else if(countResearchFacility === 0){
        buildStructure(droid, 'A0ResearchFacility', 1);

    }else if(countPowerGenerator < maxPowerGenerators){
        buildStructure(droid, 'A0PowerGenerator', 1);

    }else if(isStructureAvailable('A0CyborgFactory', me)
      && countStruct('A0CyborgFactory') < maxCyborgFactories){
        buildStructure(droid, 'A0CyborgFactory', 1);

    }else if(countResearchFacility < maxResearchFacilities){
        buildStructure(droid, 'A0ResearchFacility', 1);

    }else if(countStruct('A0CommandCentre') === 0){
        buildStructure(droid, 'A0CommandCentre', 1);

    }else if(countLightFactory < maxFactories){
        buildStructure(droid, 'A0LightFactory', 1);

    }else if(isStructureAvailable('A0Sat-linkCentre', me)
      && countStruct('A0Sat-linkCentre') === 0){
        buildStructure(droid, 'A0Sat-linkCentre', 1);

    }else if(defenseStructures.length){
        const defenseStructure = random(defenseStructures);
        if(countStruct(defenseStructure) < maxPowerGenerators){
            buildStructure(
              droid,
              defenseStructure,
              1
            );
        }
    }
}

function perSecond(){
    const droids = enumDroid(me, DROID_CONSTRUCT);

    handleDroids(droids);
    attackEnemies();

    if(queuedPower(me) !== 0){
        return;
    }

    handleResearch('R-Sys-Autorepair-General');
    randomConstructionDroids(droids);
    randomCyborgs();
}

const researchOrder = [
  'R-Wpn-MG1Mk1',
  'R-Sys-Engineering01',
  'R-Vehicle-Engine01',
  'R-Sys-Sensor-Turret01',
  'R-Struc-PowerModuleMk1',
  'R-Struc-Factory-Cyborg',
  'R-Sys-Sensor-Tower01',
  'R-Struc-CommandRelay',
  'R-Struc-Research-Module',
  'R-Wpn-Flamer01Mk1',
  'R-Vehicle-Prop-Halftracks',
  'R-Struc-Research-Upgrade01',
  'R-Wpn-MG-Damage01',
  'R-Defense-HardcreteWall',
  'R-Wpn-Rocket05-MiniPod',
  'R-Struc-Research-Upgrade02',
  'R-Wpn-Cannon1Mk1',
  'R-Defense-Tower01',
  'R-Struc-Research-Upgrade03',
  'R-Defense-Tower06',
  'R-Struc-Research-Upgrade04',
  'R-Struc-Power-Upgrade01',
  'R-Sys-Sensor-Upgrade01',
  'R-Struc-Research-Upgrade05',
  'R-Struc-Power-Upgrade01b',
  'R-Sys-Sensor-Upgrade02',
  'R-Struc-Research-Upgrade06',
  'R-Struc-Power-Upgrade01c',
  'R-Sys-Sensor-Upgrade03',
  'R-Struc-Research-Upgrade07',
  'R-Struc-Power-Upgrade02',
  'R-Struc-Research-Upgrade08',
  'R-Struc-Power-Upgrade03',
  'R-Struc-Research-Upgrade09',
  'R-Struc-Power-Upgrade03a',
  'R-Sys-Autorepair-General',
];
const researchExcluded = [
  'R-Cyborg-Transport',
  'R-Defense-Cannon6',
  'R-Defense-EMPCannon',
  'R-Defense-GuardTower-Rail1',
  'R-Defense-HardcreteGate',
  'R-Defense-Howitzer-Incendiary',
  'R-Defense-HvyFlamer',
  'R-Defense-HvyHowitzer',
  'R-Defense-MassDriver',
  'R-Defense-MortarPit',
  'R-Defense-MRL',
  'R-Defense-Pillbox01',
  'R-Defense-Pillbox04',
  'R-Defense-Pillbox05',
  'R-Defense-Pillbox06',
  'R-Defense-PlasmaCannon',
  'R-Defense-PlasmiteFlamer',
  'R-Defense-RotMG',
  'R-Defense-Super-Cannon',
  'R-Defense-TankTrap01',
  'R-Defense-WallTower02',
  'R-Defense-WallTower06',
  'R-Struc-RepairFacility',
  'R-Struc-VTOLPad',
  'R-SuperTransport',
  'R-Sys-CBSensor-Tower01',
  'R-Sys-MobileRepairTurret01',
  'R-Sys-RadarDetector01',
  'R-Sys-SpyTower',
  'R-Wpn-AAGun01',
  'R-Wpn-AAGun03',
  'R-Wpn-Bomb01',
  'R-Wpn-Bomb02',
  'R-Wpn-Bomb03',
  'R-Wpn-Bomb04',
  'R-Wpn-Bomb05',
  'R-Wpn-Bomb06',
  'R-Wpn-Sunburst',
];

globalThis.eventAttacked = defend;
globalThis.eventDroidBuilt = droidBuilt;
globalThis.eventObjectTransfer = defendTransfer;
globalThis.eventStructureBuilt = minuteDroid;
globalThis.perMinute = minuteDroid;
