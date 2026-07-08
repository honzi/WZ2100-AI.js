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

    }else if(countLightFactory < maxFactories){
        buildStructure(droid, 'A0LightFactory', 1);

    }else if(countStruct('A0CommandCentre', me) === 0){
        buildStructure(droid, 'A0CommandCentre', 1);

    }else if(countResearchFacility < maxResearchFacilities){
        buildStructure(droid, 'A0ResearchFacility', 1);

    }else if(isStructureAvailable('A0Sat-linkCentre', me)
      && countStruct('A0Sat-linkCentre', me) === 0){
        buildStructure(droid, 'A0Sat-linkCentre', 1);

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

    }else if(isStructureAvailable('X-Super-Missile', me)){
        buildStructure(
          droid,
          'X-Super-Missile',
          1
        );
    }
}

function perMinute(){
    maxPowerGenerators = 1 + Math.ceil(enumStruct(me, RESOURCE_EXTRACTOR).length / 4);

    const droids = enumDroid(me);
    const structures = enumStruct();
    droids.some(function check_droid(droid, index){
        if(index === droids.length - 2
          && isBuilding(droid)){
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

function perSecond(){
    const droids = enumDroid(me, DROID_CONSTRUCT);

    handleDroids(droids);

    randomConstructionDroids(droids);
    handleResearch(
      'R-Defense-Super-Missile',
      false
    );
}

function researchList(){
    return [
      'R-Defense-Super-Missile',
      'R-Wpn-Missile-Accuracy01',
      'R-Wpn-Missile-Accuracy02',
      'R-Wpn-Missile-Damage01',
      'R-Wpn-Missile-Damage02',
      'R-Wpn-Missile-Damage03',
      'R-Wpn-Missile-ROF01',
      'R-Wpn-Missile-ROF02',
      'R-Wpn-Missile-ROF03',
      'R-Wpn-Missile2A-T',
      'R-Wpn-Rocket-Accuracy01',
      'R-Wpn-Rocket-Accuracy02',
      'R-Wpn-Rocket-Damage01',
      'R-Wpn-Rocket-Damage02',
      'R-Wpn-Rocket-Damage03',
      'R-Wpn-Rocket-Damage04',
      'R-Wpn-Rocket-Damage05',
      'R-Wpn-Rocket01-LtAT',
      'R-Wpn-Rocket05-MiniPod',
      'R-Wpn-Rocket07-Tank-Killer',
      'R-Wpn-RocketSlow-Accuracy01',
      'R-Wpn-RocketSlow-Accuracy02',
    ];
}

maxPowerReserve = 100000;
const researchOrder = [
  'R-Sys-Engineering01',
  'R-Sys-Sensor-Turret01',
  'R-Vehicle-Engine01',
  'R-Defense-HardcreteWall',
  'R-Sys-Sensor-Tower01',
  'R-Struc-PowerModuleMk1',
  'R-Defense-WallUpgrade01',
  'R-Wpn-Rocket05-MiniPod',
  'R-Struc-CommandRelay',
  'R-Defense-WallUpgrade02',
  'R-Wpn-Rocket-Damage01',
  'R-Struc-Research-Module',
  'R-Wpn-Rocket-Damage02',
  'R-Struc-Research-Upgrade01',
  'R-Defense-WallUpgrade03',
  'R-Struc-Research-Upgrade02',
  'R-Wpn-Rocket-Damage03',
  'R-Wpn-Rocket-Accuracy01',
  'R-Struc-Research-Upgrade03',
  'R-Wpn-Rocket01-LtAT',
  'R-Struc-Research-Upgrade04',
  'R-Wpn-Rocket-Damage04',
  'R-Struc-Power-Upgrade01',
  'R-Sys-Sensor-Upgrade01',
  'R-Struc-Research-Upgrade05',
  'R-Wpn-Rocket-Damage05',
  'R-Sys-Engineering02',
  'R-Struc-Power-Upgrade01b',
  'R-Sys-Sensor-Upgrade02',
  'R-Struc-Research-Upgrade06',
  'R-Defense-WallUpgrade04',
  'R-Struc-Power-Upgrade01c',
  'R-Struc-Research-Upgrade07',
  'R-Struc-Power-Upgrade02',
  'R-Sys-Sensor-Upgrade03',
  'R-Wpn-Rocket-Accuracy02',
  'R-Struc-Research-Upgrade08',
  'R-Struc-Power-Upgrade03',
  'R-Defense-WallUpgrade05',
  'R-Struc-Research-Upgrade09',
  'R-Struc-Power-Upgrade03a',
  'R-Wpn-RocketSlow-Accuracy01',
  'R-Wpn-Rocket-Damage06',
  'R-Sys-Autorepair-General',
  'R-Wpn-RocketSlow-Accuracy02',
  'R-Wpn-Rocket07-Tank-Killer',
  'R-Defense-WallUpgrade06',
  'R-Sys-Engineering03',
  'R-Wpn-Missile2A-T',
  'R-Defense-WallUpgrade07',
  'R-Wpn-Missile-ROF01',
  'R-Defense-WallUpgrade08',
  'R-Wpn-Missile-ROF02',
  'R-Defense-WallUpgrade09',
  'R-Wpn-Missile-ROF03',
  'R-Defense-WallUpgrade10',
  'R-Defense-Super-Missile',
];

globalThis.eventStructureBuilt = perMinute;
