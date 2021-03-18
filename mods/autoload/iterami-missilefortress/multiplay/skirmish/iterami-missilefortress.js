include('iterami.js');

function eventPickup(feature, droid){
    if(droid.player === me){
        orderDroid(
          droid,
          DORDER_RTB
        );
    }
}

function init(){
    perSecond();
    setTimer(
      'perSecond',
      1000
    );
    setTimer(
      'perMinute',
      60000
    );

    maxCyborgFactories = 0;
}

function perMinute(){
    resourceExtractorCount = enumStruct(
      me,
      RESOURCE_EXTRACTOR
    ).length;
    maxPowerGenerators = 1 + Math.ceil(resourceExtractorCount / 4);

    const droids = enumDroid(me);
    const structures = enumStructByType(
      me,
      [
        DEFENSE,
        FACTORY,
        RESEARCH_LAB,
        SAT_UPLINK,
        POWER_GEN,
        HQ,
      ],
      ALL_PLAYERS
    );

    droids.some(function check_droid(droid){
        if(droid.order === DORDER_BUILD
          || droid.order === DORDER_HELPBUILD){
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
            const research = enumResearch();

            if(research.length === 0){
                maxConstructionDroids = 6;
                maxResearchFacilities = 1;
                return;
            }

            startResearch(
              researchFacility,
              research[Math.floor(Math.random() * research.length)].name
            );

        }else{
            startResearch(
              researchFacility,
              researchOrder
            );
        }
    });

    const droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var damagedStructure = false;
    const droidCount = droids.length;
    const structures = enumStruct(me);
    var unfinishedStructure = false;
    var visibleFeature = false;
    var visibleOil = false;

    for(var structure in structures){
        if(damagedStructure !== false
          && unfinishedStructure !== false){
            break;
        }

        if(structures[structure].stattype === RESOURCE_EXTRACTOR){
            continue;
        }

        if(structures[structure].status !== BUILT){
            unfinishedStructure = structures[structure];

        }else if(structures[structure].health < 100){
            damagedStructure = structures[structure];
        }
    }

    if(damagedStructure === false){
        const features = enumFeature(me);
        for(var i = features.length - 1; i >= 0; i--){
            const stattype = features[i].stattype;

            if(stattype === OIL_RESOURCE){
                visibleOil = features[i];
                break;
            }
        }

        if(visibleOil === false){
            for(var i = features.length - 1; i >= 0; i--){
                const stattype = features[i].stattype;

                if(stattype === OIL_DRUM
                  || stattype === ARTIFACT){
                    visibleFeature = features[i];
                    break;
                }
            }
        }
    }

    droids.some(function check_droid(droid){
        const isProjectManager = droid === droids[droidCount - 1];
        const isScout = droid === droids[droidCount - 2];

        if(!isProjectManager){
            if(isScout){
                if(visibleOil !== false){
                    if(droid.order !== DORDER_BUILD){
                        buildStructure(
                          droid,
                          'A0ResourceExtractor',
                          visibleOil.x,
                          visibleOil.y
                        );
                    }

                    return;

                }else if(visibleFeature !== false
                  && droid.order !== DORDER_BUILD){
                    if(droid.order !== DORDER_RECOVER){
                        orderDroidObj(
                          droid,
                          DORDER_RECOVER,
                          visibleFeature
                        );
                    }

                    return;
                }

            }else if(damagedStructure !== false){
                if(droid.order !== DORDER_REPAIR){
                    orderDroidObj(
                      droid,
                      DORDER_REPAIR,
                      damagedStructure
                    );
                }

                return;
            }
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
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              droid,
              'A0PowerGenerator'
            );

        }else if(checkStructure(
            'A0ResourceExtractor',
            4
          )){
            buildStructure(
              droid,
              'A0ResourceExtractor'
            );

        }else if(checkStructure(
            'A0LightFactory',
            1
          )){
            buildStructure(
              droid,
              'A0LightFactory'
            );

        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        }else if(checkStructure(
            'A0LightFactory',
            maxFactories
          )){
            buildStructure(
              droid,
              'A0LightFactory'
            );

        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              droid,
              'A0CommandCentre'
            );

        }else if(checkStructure(
            'A0PowerGenerator',
            maxPowerGenerators
          )){
            buildStructure(
              droid,
              'A0PowerGenerator'
            );

        }else if(checkStructure(
            'A0Sat-linkCentre',
            1
          )){
            buildStructure(
              droid,
              'A0Sat-linkCentre'
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
                  powerModuleNeeded.x,
                  powerModuleNeeded.y
                );

            }else if(researchModuleNeeded !== false){
                buildStructure(
                  droid,
                  'A0ResearchModule1',
                  researchModuleNeeded.x,
                  researchModuleNeeded.y
                );

            }else if(factoryModuleNeeded !== false){
                buildStructure(
                  droid,
                  'A0FacMod1',
                  factoryModuleNeeded.x,
                  factoryModuleNeeded.y
                );

            }else if(isStructureAvailable(
                'X-Super-Missile',
                me
              )){
                buildStructure(
                  droid,
                  'X-Super-Missile'
                );
            }
        }
    });

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

    setMiniMap(true);
}

function startResearch(researchFacility, research){
    if(!researchRandom){
        const targetResearch = getResearch('R-Defense-Super-Missile');

        if(targetResearch.done
          || targetResearch.started){
            maxConstructionDroids = 10;
            researchRandom = true;
        }
    }

    pursueResearch(
      researchFacility,
      research
    );
}

var maxConstructionDroids = 3;
var researchRandom = false;

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
