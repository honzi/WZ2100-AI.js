include('honzibot.js');

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

    groupAddDroid(
      groupDefend,
      droid
    );

    if(groupSize(groupScout) < maxCyborgsScout){
        groupAddDroid(
          groupScout,
          droid
        );

    }else if(groupSize(groupDefend) > maxCyborgsDefend){
        const defenders = enumGroup(groupDefend);
        groupAddDroid(
          groupAttack,
          defenders[Math.floor(Math.random() * defenders.length)]
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
        randomLocation(
          groupScout,
          DORDER_MOVE
        );
    }
    if(groupSize(groupAttack) >= minCyborgsAttackStructures){
        randomLocation(
          groupAttack,
          DORDER_SCOUT
        );
    }

    const structures = enumStruct();
    const constructionDroids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    constructionDroids.some(function check_droid(droid, index){
        if(index === constructionDroids.length - 2
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

    const droids = enumDroid(me);
    droids.some(function check_droid(droid){
        if(droid.droidType === DROID_CONSTRUCT
          || droid.group !== groupDefend){
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
    const droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    const droidCount = droids.length;
    const tooMuchPower = playerPower(me) > maxPowerReserve;

    if(enumResearch().length === 0){
        maxConstructionDroids = 7;
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

            if(researchRandom
              || tooMuchPower){
                if(droidCount >= maxConstructionDroids){
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
                }

            }else{
                const targetResearch = getResearch('R-Sys-Autorepair-General');

                if(targetResearch.done
                  || targetResearch.started){
                    maxCyborgsDefend = 20;
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

    }else if(productionBegin
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
            'A0LightFactory',
            1
          )){
            buildStructure(
              droid,
              'A0LightFactory',
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
            'A0PowerGenerator',
            maxPowerGenerators
          )){
            buildStructure(
              droid,
              'A0PowerGenerator',
              maxBlockingTiles
            );

        }else if(checkStructure(
            'A0CyborgFactory',
            maxCyborgFactories
          )){
            buildStructure(
              droid,
              'A0CyborgFactory',
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
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              droid,
              'A0ResearchFacility',
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

            }else{
                const defenseStructure = defenseStructures[Math.floor(Math.random() * defenseStructures.length)];

                if(checkStructure(
                    defenseStructure,
                    maxPowerGenerators
                  )){
                    buildStructure(
                      droid,
                      defenseStructure,
                      0
                    );
                }
            }
        }
    });

    let attacking = false;
    playerData.forEach(function(player, id){
        if(attacking
          || groupSize(groupAttack) < minCyborgsAttack
          || allianceExistsBetween(me, id)){
            return;
        }

        if(groupSize(groupAttack) >= minCyborgsAttackStructures){
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

            const others = enumStructByType(
              id,
              [
                REARM_PAD,
                WALL,
                GATE,
              ],
              me
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

const groupAttack = newGroup();
const groupDefend = newGroup();
const groupScout = newGroup();
let maxConstructionDroids = 4;
let maxCyborgsDefend = 25;
let maxCyborgsScout = 1;
let maxPowerReserve = 2000;
let maxPowerResearchAll = 100000;
let minCyborgsAttack = 10;
let minCyborgsAttackStructures = 40;
let productionBegin = false;

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
