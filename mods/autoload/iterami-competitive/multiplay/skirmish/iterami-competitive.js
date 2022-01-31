include('iterami.js');

function eventAttacked(victim, attacker){
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
      && victim.stattype !== RESOURCE_EXTRACTOR){
        attack(
          groupDefend,
          attacker,
          true
        );
    }
}

function eventDroidBuilt(droid, structure){
    if(droid.droidType === DROID_CONSTRUCT){
        return;
    }

    groupAddDroid(
      groupDefend,
      droid
    );

    if(groupSize(groupDefend) >= limitDroidsAttack){
        const defenders = enumGroup(groupDefend);

        for(var i = 0; i < maxDroidsDefend; i++){
            groupAddDroid(
              groupAttack,
              defenders[Math.floor(Math.random() * (defenders.length - i))]
            );
        }
    }
}

function eventObjectTransfer(gameObject, from){
    if(gameObject.player === me){
        if(gameObject.type === DROID){
            groupAddDroid(
              groupDefend,
              gameObject
            );
        }
    }
}

function eventPickup(feature, droid){
    if(droid.player === me){
        orderDroid(
          droid,
          DORDER_RTB
        );
    }
}

function eventStructureBuilt(structure, droid){
    perMinute();
}

function init(){
    maxCyborgFactories = 0;

    perSecond();
    setTimer(
      'perSecond',
      1000
    );
    setTimer(
      'perMinute',
      60000
    );
}

function perMinute(){
    resourceExtractorCount = enumStruct(
      me,
      RESOURCE_EXTRACTOR
    ).length;
    maxPowerGenerators = 1 + Math.ceil(resourceExtractorCount / 4);

    if(groupSize(groupAttack) >= minDroidsAttackStructures){
        const droids = enumGroup(groupAttack);
        droids.some(function check_droid(droid){
            randomLocation(droid);
        });
    }

    const droids = enumDroid(me);
    const structures = enumStruct();

    droids.some(function check_droid(droid){
        if(droid.group === groupAttack){
            return;
        }

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
            randomResearch(researchFacility);

        }else{
            startResearch(
              researchFacility,
              researchOrder
            );
        }
    });

    if(productionBegin
      || groupSize(groupDefend) < maxDroidsDefend){
        const factories = enumStruct(
          me,
          'A0LightFactory'
        );
        factories.some(function check_factory(factory){
            if(factory.status !== BUILT
              || !structureIdle(factory)
              || droidWeapons.length === 0){
                return;
            }

            randomWeaponDroid(factory);
        });
    }

    const droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var damagedStructure = false;
    const droidCount = droids.length;
    const structures = enumStruct(me);
    var unfinishedStructure = false;
    var visibleFeature = false;
    var visibleFeaturesChecked = false;
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

    droids.some(function check_droid(droid){
        const isProjectManager = droid === droids[droidCount - 1];
        const isScout = droid === droids[droidCount - 2];

        if(!isProjectManager){
            if(isScout){
                if(visibleFeaturesChecked === false){
                    visibleFeaturesChecked = true;

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

            }else{
                const defenseStructure = defenseStructures[Math.floor(Math.random() * defenseStructures.length)];

                if(checkStructure(
                    defenseStructure,
                    maxDefenseStructures
                  )){
                    buildStructure(
                      droid,
                      defenseStructure
                    );
                }
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

    var attacking = false;
    playerData.forEach(function(player, id){
        if(attacking
          || groupSize(groupAttack) < minDroidsAttack
          || allianceExistsBetween(me, id)){
            return;
        }

        if(groupSize(groupAttack) >= minDroidsAttackStructures){
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
                REARM_PAD,
                WALL,
                GATE,
              ],
              me
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
        }

        const droids = enumDroid(
          id,
          DROID_ANY,
          me
        );
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

    setMiniMap(true);
}

function randomResearch(researchFacility){
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
}

function startResearch(researchFacility, research){
    if(!researchRandom){
        const targetResearch = getResearch('R-Sys-Autorepair-General');

        if(targetResearch.done
          || targetResearch.started){
            productionBegin = true;
            researchRandom = true;
        }
    }

    pursueResearch(
      researchFacility,
      research
    );
}

const groupAttack = newGroup();
const groupDefend = newGroup();
var limitDroidsAttack = 40;
var maxConstructionDroids = 3;
var maxDefenseStructures = 3;
var maxDroidsDefend = 20;
var minDroidsAttack = 10;
var minDroidsAttackStructures = 40;
var productionBegin = false;
var researchRandom = false;

const researchOrder = [
  'R-Sys-Engineering01',
  'R-Vehicle-Engine01',
  'R-Sys-Sensor-Turret01',
  'R-Struc-PowerModuleMk1',
  'R-Sys-Sensor-Tower01',
  'R-Struc-CommandRelay',
  'R-Struc-Research-Module',
  'R-Wpn-MG1Mk1',
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
