'use strict';
include('honzibot-common.js');

function droidConstruct(droid){
    const countPowerGenerator = countStruct('A0PowerGenerator', me);
    const countLightFactory = countStruct('A0LightFactory', me);
    const countResearchFacility = countStruct('A0ResearchFacility', me);
    const needPowerModule = checkNeedModule('A0PowerGenerator', 'A0PowMod1', 1);
    const needFactoryModule = checkNeedModule('A0LightFactory', 'A0FacMod1', 2);
    const needResearchModule = checkNeedModule('A0ResearchFacility', 'A0ResearchModule1', 1);

    if(countStruct('A0ResourceExtractor', me) === 0){
        buildStructure(droid, 'A0ResourceExtractor', -1);

    }else if(countPowerGenerator === 0){
        buildStructure(droid, 'A0PowerGenerator', 1);

    }else if(needPowerModule !== false){
        buildStructure(droid, 'A0PowMod1', -1, 0,
          needPowerModule.x,
          needPowerModule.y
        );

    }else if(countLightFactory === 0){
        buildStructure(droid, 'A0LightFactory', 1);

    }else if(countResearchFacility === 0){
        buildStructure(droid, 'A0ResearchFacility', 1);

    }else if(countPowerGenerator < maxPowerGenerators){
        buildStructure(droid, 'A0PowerGenerator', 1);

    }else if(isStructureAvailable('A0CyborgFactory', me)
      && countStruct('A0CyborgFactory', me) < maxCyborgFactories){
        buildStructure(droid, 'A0CyborgFactory', 1);

    }else if(countLightFactory < maxFactories){
        buildStructure(droid, 'A0LightFactory', 1);

    }else if(countStruct('A0CommandCentre', me) === 0){
        buildStructure(droid, 'A0CommandCentre', 1);

    }else if(isStructureAvailable('A0Sat-linkCentre', me)
      && countStruct('A0Sat-linkCentre', me) === 0){
        buildStructure(droid, 'A0Sat-linkCentre', 1);

    }else if(countResearchFacility < maxResearchFacilities){
        buildStructure(droid, 'A0ResearchFacility', 1);

    }else if(needResearchModule !== false){
        buildStructure(droid, 'A0ResearchModule1', -1, 0,
          needResearchModule.x,
          needResearchModule.y
        );

    }else if(needFactoryModule !== false){
        buildStructure(droid, 'A0FacMod1', -1, 0,
          needFactoryModule.x,
          needFactoryModule.y
        );

    }else if(defenseStructures.length){
        const defenseStructure = random(defenseStructures);
        if(countStruct(defenseStructure, me) < maxPowerGenerators){
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

    randomConstructionDroids(droids);
    randomCyborgs();
    handleResearch('R-Sys-Autorepair-General');
}

function researchList(){
    return [
      'R-Cyborg-Armor-Heat01',
      'R-Cyborg-Armor-Heat02',
      'R-Cyborg-Armor-Heat03',
      'R-Cyborg-Armor-Heat04',
      'R-Cyborg-Armor-Heat05',
      'R-Cyborg-Armor-Heat06',
      'R-Cyborg-Armor-Heat07',
      'R-Cyborg-Armor-Heat08',
      'R-Cyborg-Armor-Heat09',
      'R-Cyborg-Hvywpn-A-T',
      'R-Cyborg-Hvywpn-Acannon',
      'R-Cyborg-Hvywpn-HPV',
      'R-Cyborg-Hvywpn-Mcannon',
      'R-Cyborg-Hvywpn-PulseLsr',
      'R-Cyborg-Hvywpn-RailGunner',
      'R-Cyborg-Hvywpn-TK',
      'R-Cyborg-Metals01',
      'R-Cyborg-Metals02',
      'R-Cyborg-Metals03',
      'R-Cyborg-Metals04',
      'R-Cyborg-Metals05',
      'R-Cyborg-Metals06',
      'R-Cyborg-Metals07',
      'R-Cyborg-Metals08',
      'R-Cyborg-Metals09',
      'R-Defense-Emplacement-HPVcannon',
      'R-Defense-Pillbox01',
      'R-Defense-PrisLas',
      'R-Defense-PulseLas',
      'R-Defense-Super-Missile',
      'R-Defense-Tower06',
      'R-Defense-Wall-RotMg',
      'R-Defense-WallTower-HPVcannon',
      'R-Defense-WallTower-PulseLas',
      'R-Defense-WallTower-TwinAGun',
      'R-Defense-WallTower01',
      'R-Wpn-Cannon-Accuracy01',
      'R-Wpn-Cannon-Accuracy02',
      'R-Wpn-Cannon-Damage02',
      'R-Wpn-Cannon-Damage03',
      'R-Wpn-Cannon-Damage04',
      'R-Wpn-Cannon-Damage05',
      'R-Wpn-Cannon-Damage06',
      'R-Wpn-Cannon-Damage07',
      'R-Wpn-Cannon-Damage08',
      'R-Wpn-Cannon-Damage09',
      'R-Wpn-Cannon-ROF01',
      'R-Wpn-Cannon-ROF02',
      'R-Wpn-Cannon-ROF03',
      'R-Wpn-Cannon-ROF04',
      'R-Wpn-Cannon-ROF05',
      'R-Wpn-Cannon-ROF06',
      'R-Wpn-Cannon2Mk1',
      'R-Wpn-Cannon3Mk1',
      'R-Wpn-Cannon4AMk1',
      'R-Wpn-Cannon5',
      'R-Wpn-Energy-Accuracy01',
      'R-Wpn-Energy-Damage01',
      'R-Wpn-Energy-Damage02',
      'R-Wpn-Energy-Damage03',
      'R-Wpn-Energy-ROF01',
      'R-Wpn-Energy-ROF02',
      'R-Wpn-Energy-ROF03',
      'R-Wpn-Flame2',
      'R-Wpn-Flamer',
      'R-Wpn-Flamer-Damage01',
      'R-Wpn-Flamer-Damage02',
      'R-Wpn-Flamer-Damage03',
      'R-Wpn-Flamer-Damage04',
      'R-Wpn-Flamer-Damage05',
      'R-Wpn-Flamer-Damage06',
      'R-Wpn-Flamer-Damage07',
      'R-Wpn-Flamer-Damage08',
      'R-Wpn-Flamer-Damage09',
      'R-Wpn-Flamer-ROF01',
      'R-Wpn-Flamer-ROF02',
      'R-Wpn-Flamer-ROF03',
      'R-Wpn-Flamer01Mk1',
      'R-Wpn-Laser01',
      'R-Wpn-Laser02',
      'R-Wpn-MG-Damage02',
      'R-Wpn-MG-Damage03',
      'R-Wpn-MG-Damage04',
      'R-Wpn-MG-Damage05',
      'R-Wpn-MG-Damage06',
      'R-Wpn-MG-Damage07',
      'R-Wpn-MG-Damage08',
      'R-Wpn-MG-Damage09',
      'R-Wpn-MG-Damage10',
      'R-Wpn-MG-ROF01',
      'R-Wpn-MG-ROF02',
      'R-Wpn-MG-ROF03',
      'R-Wpn-MG2Mk1',
      'R-Wpn-MG3Mk1',
      'R-Wpn-MG4',
      'R-Wpn-MG5',
      'R-Wpn-Missile-Accuracy01',
      'R-Wpn-Missile-Accuracy02',
      'R-Wpn-Missile-Damage01',
      'R-Wpn-Missile-Damage02',
      'R-Wpn-Missile-Damage03',
      'R-Wpn-Missile-ROF01',
      'R-Wpn-Missile-ROF02',
      'R-Wpn-Missile-ROF03',
      'R-Wpn-Missile2A-T',
      'R-Wpn-Mortar-Acc02',
      'R-Wpn-Mortar-Acc03',
      'R-Wpn-Mortar-Damage02',
      'R-Wpn-Mortar-Damage03',
      'R-Wpn-Mortar-Damage04',
      'R-Wpn-Mortar-Damage05',
      'R-Wpn-Mortar-Damage06',
      'R-Wpn-Mortar-ROF01',
      'R-Wpn-Mortar-ROF02',
      'R-Wpn-Mortar-ROF03',
      'R-Wpn-Mortar-ROF04',
      'R-Wpn-Rail-Accuracy01',
      'R-Wpn-Rail-Damage01',
      'R-Wpn-Rail-Damage02',
      'R-Wpn-Rail-Damage03',
      'R-Wpn-Rail-ROF01',
      'R-Wpn-Rail-ROF02',
      'R-Wpn-Rail-ROF03',
      'R-Wpn-RailGun01',
      'R-Wpn-RailGun02',
      'R-Wpn-RailGun03',
      'R-Wpn-Rocket-Accuracy01',
      'R-Wpn-Rocket-Accuracy02',
      'R-Wpn-Rocket-Damage01',
      'R-Wpn-Rocket-Damage02',
      'R-Wpn-Rocket-Damage03',
      'R-Wpn-Rocket-Damage04',
      'R-Wpn-Rocket-Damage05',
      'R-Wpn-Rocket-Damage06',
      'R-Wpn-Rocket-Damage07',
      'R-Wpn-Rocket-Damage08',
      'R-Wpn-Rocket-Damage09',
      'R-Wpn-Rocket-ROF01',
      'R-Wpn-Rocket-ROF02',
      'R-Wpn-Rocket-ROF03',
      'R-Wpn-Rocket01-LtAT',
      'R-Wpn-Rocket05-MiniPod',
      'R-Wpn-Rocket07-Tank-Killer',
      'R-Wpn-RocketSlow-Accuracy01',
      'R-Wpn-RocketSlow-Accuracy02',
    ];
}

const researchOrder = [
  'R-Sys-Engineering01',
  'R-Sys-Sensor-Turret01',
  'R-Vehicle-Engine01',
  'R-Sys-Sensor-Tower01',
  'R-Struc-PowerModuleMk1',
  'R-Struc-Factory-Cyborg',
  'R-Struc-CommandRelay',
  'R-Struc-Research-Module',
  'R-Wpn-Flamer01Mk1',
  'R-Struc-Research-Upgrade01',
  'R-Struc-Research-Upgrade02',
  'R-Struc-Research-Upgrade03',
  'R-Struc-Research-Upgrade04',
  'R-Struc-Power-Upgrade01',
  'R-Sys-Sensor-Upgrade01',
  'R-Struc-Research-Upgrade05',
  'R-Struc-Power-Upgrade01b',
  'R-Sys-Sensor-Upgrade02',
  'R-Struc-Research-Upgrade06',
  'R-Struc-Power-Upgrade01c',
  'R-Struc-Research-Upgrade07',
  'R-Struc-Power-Upgrade02',
  'R-Sys-Sensor-Upgrade03',
  'R-Struc-Research-Upgrade08',
  'R-Struc-Power-Upgrade03',
  'R-Struc-Research-Upgrade09',
  'R-Struc-Power-Upgrade03a',
  'R-Sys-Autorepair-General',
];

globalThis.eventAttacked = defend;
globalThis.eventDroidBuilt = droidBuilt;
globalThis.eventObjectTransfer = defendTransfer;
globalThis.eventStructureBuilt = minuteDroid;
globalThis.perMinute = minuteDroid;
