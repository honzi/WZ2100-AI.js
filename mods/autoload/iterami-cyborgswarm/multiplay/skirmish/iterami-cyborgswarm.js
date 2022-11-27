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

    }else if(victim.type === STRUCTURE){
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

    if(groupSize(groupScout) < maxCyborgsScout){
        groupAddDroid(
          groupScout,
          droid
        );

    }else if(groupSize(groupDefend) >= limitCyborgsAttack){
        const defenders = enumGroup(groupDefend);
        for(let i = 0; i < maxCyborgsDefend; i++){
            groupAddDroid(
              groupAttack,
              defenders[Math.floor(Math.random() * (defenders.length - i))]
            );
        }

    }else{
        groupAddDroid(
          groupDefend,
          droid
        );
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
    maxFactories = Math.min(
      maxFactories,
      2
    );

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

    if(groupSize(groupScout) > 0){
        const droids = enumGroup(groupScout);
        droids.some(function check_droid(droid){
            randomLocation(droid);
        });
    }

    if(groupSize(groupAttack) >= minCyborgsAttackStructures){
        const droids = enumGroup(groupAttack);
        droids.some(function check_droid(droid){
            randomLocation(droid);
        });
    }

    const defenseDroids = enumGroup(groupDefend);
    const structures = enumStruct();
    defenseDroids.some(function check_droid(droid){
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

function perMinuteStart(){
    removeTimer('perMinuteStart');
    setTimer(
      'perMinute',
      60000
    );
}

function perSecond(){
    const tooMuchPower = playerPower(me) > maxPowerReserve;
    const researchFacilities = enumStruct(
      me,
      'A0ResearchFacility'
    );
    researchFacilities.some(function check_researchFacility(researchFacility){
        if(researchFacility.status !== BUILT
          || !structureIdle(researchFacility)){
            return;
        }

        if(researchRandom
          || tooMuchPower){
            randomResearch(researchFacility);

        }else{
            startResearch(
              researchFacility,
              researchOrder
            );
        }
    });

    if(productionBegin
      || tooMuchPower
      || groupSize(groupDefend) < maxCyborgsDefend){
        const cyborgFactories = enumStruct(
          me,
          'A0CyborgFactory'
        );
        cyborgFactories.some(function check_cyborgFactory(cyborgFactory){
            if(cyborgFactory.status !== BUILT
              || !structureIdle(cyborgFactory)
              || cyborgWeapons.length === 0){
                return;
            }

            randomCyborg(cyborgFactory);
        });
    }

    const droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    let damagedStructure = false;
    const droidCount = droids.length;
    const structures = enumStruct(me);
    let unfinishedStructure = false;

    let damagedHealth = 100;
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
        const isScout = index === droidCount - 2;

        if(isScout){
            const features = enumFeature(me);
            for(let i = features.length - 1; i >= 0; i--){
                const stattype = features[i].stattype;

                if(stattype === ARTIFACT){
                    if(droid.order !== DORDER_RECOVER){
                        orderDroidObj(
                          droid,
                          DORDER_RECOVER,
                          features[i]
                        );
                    }

                    return;

                }else if(stattype === OIL_RESOURCE){
                    if(droid.order !== DORDER_BUILD){
                        buildStructure(
                          droid,
                          'A0ResourceExtractor',
                          -1,
                          1,
                          features[i].x,
                          features[i].y
                        );
                    }

                    return;

                }else if(stattype === OIL_DRUM){
                    if(droid.order !== DORDER_RECOVER){
                        orderDroidObj(
                          droid,
                          DORDER_RECOVER,
                          features[i]
                        );
                    }

                    return;
                }
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
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              droid,
              'A0ResearchFacility',
              1
            );

        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              droid,
              'A0PowerGenerator',
              1
            );

        }else if(checkStructure(
            'A0ResourceExtractor',
            4
          )){
            buildStructure(
              droid,
              'A0ResourceExtractor',
              -1
            );

        }else if(checkStructure(
            'A0LightFactory',
            1
          )){
            buildStructure(
              droid,
              'A0LightFactory',
              1
            );

        }else if(checkStructure(
            'A0PowerGenerator',
            maxPowerGenerators
          )){
            buildStructure(
              droid,
              'A0PowerGenerator',
              1
            );

        }else if(checkStructure(
            'A0CyborgFactory',
            maxCyborgFactories
          )){
            buildStructure(
              droid,
              'A0CyborgFactory',
              1
            );

        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              droid,
              'A0CommandCentre',
              1
            );

        }else if(checkStructure(
            'A0LightFactory',
            maxFactories
          )){
            buildStructure(
              droid,
              'A0LightFactory',
              1
            );

        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              droid,
              'A0ResearchFacility',
              1
            );

        }else if(checkStructure(
            'A0Sat-linkCentre',
            1
          )){
            buildStructure(
              droid,
              'A0Sat-linkCentre',
              1
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
                  1,
                  powerModuleNeeded.x,
                  powerModuleNeeded.y
                );

            }else if(researchModuleNeeded !== false){
                buildStructure(
                  droid,
                  'A0ResearchModule1',
                  -1,
                  1,
                  researchModuleNeeded.x,
                  researchModuleNeeded.y
                );

            }else if(factoryModuleNeeded !== false){
                buildStructure(
                  droid,
                  'A0FacMod1',
                  -1,
                  1,
                  factoryModuleNeeded.x,
                  factoryModuleNeeded.y
                );

            }else{
                const defenseStructure = defenseStructures[Math.floor(Math.random() * defenseStructures.length)];

                if(checkStructure(
                    defenseStructure,
                    maxPowerGenerators
                  )){
                    buildStructure(
                      droid,
                      defenseStructure,
                      1
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

    let attacking = false;
    playerData.forEach(function(player, id){
        if(attacking
          || groupSize(groupAttack) < minCyborgsAttack
          || allianceExistsBetween(me, id)){
            return;
        }

        if(groupSize(groupAttack) >= minCyborgsAttackStructures){
            let structures = enumStructByType(
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

            structures = enumStructByType(
              id,
              [
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
            maxCyborgsDefend = 20;
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
const groupScout = newGroup();
let limitCyborgsAttack = 40;
let maxConstructionDroids = 3;
let maxCyborgsDefend = 30;
let maxCyborgsScout = 1;
let maxPowerReserve = 2000;
let minCyborgsAttack = 10;
let minCyborgsAttackStructures = 40;
let productionBegin = false;
let researchRandom = false;

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
