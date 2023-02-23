include('iterami.js');

function init(){
    maxCyborgFactories = 0;

    perSecond();
    setTimer(
      'perSecond',
      1000
    );
    setTimer(
      'perMinuteStart',
      60000 - (me * 1000)
    );
}

function perMinute(){
    resourceExtractorCount = enumStruct(
      me,
      RESOURCE_EXTRACTOR
    ).length;
    maxPowerGenerators = 1 + Math.ceil(resourceExtractorCount / 4);

    const droids = enumDroid(me);
    const structures = enumStruct();
    droids.some(function check_droid(droid, index){
        if(index === droids.length - 2
          && droid.order === DORDER_BUILD){
            return;
        }

        const randomStructure = structures[Math.floor(Math.random() * structures.length)];
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
    const availableResearch = enumResearch().filter(function(value){
        return !researchExcluded.includes(value.name);
    });

    if(availableResearch.length === 0){
        maxConstructionDroids = 6;
        maxResearchFacilities = 1;

    }else{
        const researchFacilities = enumStruct(
          me,
          'A0ResearchFacility'
        );
        researchFacilities.some(function check_researchFacility(researchFacility){
            if(researchFacility.status !== BUILT
              || !structureIdle(researchFacility)){
                return;
            }

            if(researchRandom){
                randomResearch(
                  researchFacility,
                  availableResearch
                );

            }else{
                const targetResearch = getResearch('R-Defense-Super-Missile');

                if(targetResearch.done
                  || targetResearch.started){
                    maxConstructionDroids = 10;
                    randomResearch = true;
                }

                pursueResearch(
                  researchFacility,
                  researchOrder
                );
            }
        });
    }

    const droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    const droidCount = droids.length;

    if(droidCount < maxConstructionDroids){
        const factories = enumStruct(
          me,
          'A0LightFactory'
        );
        factories.some(function check_factory(factory){
            if(factory.status !== BUILT
              || !structureIdle(factory)){
                return;
            }

            randomConstructionDroid(factory);
        });
    }

    let damagedHealth = 100;
    let damagedStructure = false;
    const structures = enumStruct(me);
    let unfinishedStructure = false;
    for(let structure in structures){
        if(structures[structure].status !== BUILT){
            unfinishedStructure = structures[structure];

        }else if(structures[structure].health < damagedHealth){
            damagedHealth = structures[structure].health;
            damagedStructure = structures[structure];
        }
    }

    droids.some(function check_droid(droid, index){
        const isProjectManager = index === droidCount - 1;
        const isCollector = index === droidCount - 2;

        if(isCollector){
            if(handleCollector(droid)){
                return;
            }

        }else if(damagedStructure !== false
          && index <= droidCount / 2 - 1){
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

        if(checkStructure(
            'A0ResourceExtractor',
            1
          )){
            buildStructure(
              droid,
              'A0ResourceExtractor',
              -1
            );

        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              droid,
              'A0PowerGenerator',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              droid,
              'A0ResearchFacility',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0LightFactory',
            1
          )){
            buildStructure(
              droid,
              'A0LightFactory',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0PowerGenerator',
            maxPowerGenerators
          )){
            buildStructure(
              droid,
              'A0PowerGenerator',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              droid,
              'A0ResearchFacility',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              droid,
              'A0CommandCentre',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0LightFactory',
            maxFactories
          )){
            buildStructure(
              droid,
              'A0LightFactory',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0Sat-linkCentre',
            1
          )){
            buildStructure(
              droid,
              'A0Sat-linkCentre',
              maxBlockingTiles
            );

        }else{
            const factoryModuleNeeded = checkNeedModule(
              'A0LightFactory',
              'A0FacMod1',
              2
            );
            const powerModuleNeeded = checkNeedModule(
              'A0PowerGenerator',
              'A0PowMod1',
              1
            );
            const researchModuleNeeded = checkNeedModule(
              'A0ResearchFacility',
              'A0ResearchModule1',
              1
            );

            if(powerModuleNeeded !== false){
                buildStructure(
                  droid,
                  'A0PowMod1',
                  -1,
                  0,
                  powerModuleNeeded.x,
                  powerModuleNeeded.y
                );

            }else if(researchModuleNeeded !== false){
                buildStructure(
                  droid,
                  'A0ResearchModule1',
                  -1,
                  0,
                  researchModuleNeeded.x,
                  researchModuleNeeded.y
                );

            }else if(factoryModuleNeeded !== false){
                buildStructure(
                  droid,
                  'A0FacMod1',
                  -1,
                  0,
                  factoryModuleNeeded.x,
                  factoryModuleNeeded.y
                );

            }else if(isStructureAvailable(
                'X-Super-Missile',
                me
              )){
                buildStructure(
                  droid,
                  'X-Super-Missile',
                  maxBlockingTiles
                );
            }
        }
    });

    setMiniMap(true);
}

const researchOrder = [
  'R-Sys-Engineering01',
  'R-Vehicle-Engine01',
  'R-Sys-Sensor-Turret01',
  'R-Defense-HardcreteWall',
  'R-Defense-WallUpgrade01',
  'R-Sys-Sensor-Tower01',
  'R-Struc-PowerModuleMk1',
  'R-Vehicle-Prop-Halftracks',
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
  'R-Sys-Sensor-Upgrade03',
  'R-Struc-Research-Upgrade07',
  'R-Struc-Power-Upgrade02',
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
const researchExcluded = [
  'R-Cyborg-Metals01',
  'R-Cyborg-Transport',
  'R-Defense-GuardTower-ATMiss',
  'R-Defense-HardcreteGate',
  'R-Defense-HvyA-Trocket',
  'R-Defense-Pillbox04',
  'R-Defense-Pillbox06',
  'R-Defense-Super-Rocket',
  'R-Defense-TankTrap01',
  'R-Defense-Tower01',
  'R-Defense-Tower06',
  'R-Defense-WallTower-A-Tmiss',
  'R-Defense-WallTower-HvyA-Trocket',
  'R-Struc-RepairFacility',
  'R-Struc-VTOLFactory',
  'R-SuperTransport',
  'R-Sys-MobileRepairTurret01',
  'R-Sys-MobileRepairTurretHvy',
  'R-Sys-RadarDetector01',
  'R-Sys-Sensor-Tower02',
  'R-Sys-SpyTower',
  'R-Wpn-AAGun02',
  'R-Wpn-Bomb06',
  'R-Wpn-Cannon1Mk1',
  'R-Wpn-EMPCannon',
  'R-Wpn-Flamer01Mk1',
  'R-Wpn-Laser01',
  'R-Wpn-MG-Damage01',
  'R-Wpn-MG1Mk1',
  'R-Wpn-MdArtMissile',
  'R-Wpn-Missile-LtSAM',
  'R-Wpn-Mortar01Lt',
  'R-Wpn-MortarEMP',
  'R-Wpn-Rocket-Damage07',
  'R-Wpn-Rocket02-MRL',
  'R-Wpn-Rocket03-HvAT',
  'R-Wpn-Rocket07-Tank-Killer',
  'R-Wpn-Sunburst',
];
