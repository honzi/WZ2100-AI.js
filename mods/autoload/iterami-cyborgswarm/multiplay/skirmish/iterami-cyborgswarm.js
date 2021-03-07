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

    groupAddDroid(
      groupDefend,
      droid
    );

    if(groupSize(groupDefend) >= limitCyborgsAttack){
        var defenders = enumGroup(groupDefend);

        for(var i = 0; i < maxCyborgsDefend; i++){
            groupAddDroid(
              groupAttack,
              defenders[Math.floor(Math.random() * (defenders.length - i))]
            );
        }
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

    maxFactories = Math.min(
      maxFactories,
      2
    );
}

function perMinute(){
    if(groupSize(groupAttack) >= minCyborgsAttackStructures){
        var droids = enumGroup(groupAttack);
        droids.some(function check_droid(droid){
            randomLocation(droid);
        });
    }

    var droids = enumDroid(me);
    var structures = enumStruct(me);

    droids.some(function check_droid(droid){
        if(droid.group === groupAttack){
            return;
        }

        if(droid.order === DORDER_BUILD
          || droid.order === DORDER_HELPBUILD){
            return;
        }

        var randomStructure = structures[Math.floor(Math.random() * structures.length)];
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
    var researchFacilities = enumStruct(
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
      || groupSize(groupDefend) < maxCyborgsDefend){
        var cyborgFactories = enumStruct(
          me,
          'A0CyborgFactory'
        );
        cyborgFactories.some(function check_cyborgFactory(cyborgFactory){
            if(cyborgFactory.status !== BUILT
              || !structureIdle(cyborgFactory)
              || cyborgWeapons.length === 0){
                return;
            }

            var cyborgWeapon = cyborgWeapons[Math.floor(Math.random() * cyborgWeapons.length)];

            buildDroid(
              cyborgFactory,
              'cyborg-CyborgLightBody-CyborgLegs-' + cyborgWeapon,
              'CyborgLightBody',
              'CyborgLegs',
              '',
              DROID_CYBORG,
              cyborgWeapon
            );
        });
    }

    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var droidCount = droids.length;
    var structures = enumStruct(me);
    var damagedStructure = false;
    var unfinishedStructure = false;

    for(var structure in structures){
        if(damagedStructure !== false
          && unfinishedStructure !== false){
            break;
        }

        if(structures[structure].status !== BUILT){
            unfinishedStructure = structures[structure];

        }else if(structures[structure].health < 100){
            damagedStructure = structures[structure];
        }
    }

    droids.some(function check_droid(droid){
        var isProjectManager = droid === droids[droidCount - 1];

        if(damagedStructure !== false
          && !isProjectManager){
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
            maxResourceExtractors
          )){
            buildStructure(
              droid,
              'A0ResourceExtractor'
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
            'A0CyborgFactory',
            maxCyborgFactories
          )){
            buildStructure(
              droid,
              'A0CyborgFactory'
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
            var factoryModuleNeeded = checkNeedModule(
              'A0LightFactory',
              'A0FacMod1',
              2
            );
            var powerModuleNeeded = checkNeedModule(
              'A0PowerGenerator',
              'A0PowMod1',
              1
            );
            var researchModuleNeeded = checkNeedModule(
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
                var defenseStructure = defenseStructures[Math.floor(Math.random() * defenseStructures.length)];

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
        var factories = enumStruct(
          me,
          'A0LightFactory'
        );
        factories.some(function check_factory(factory){
            if(factory.status !== BUILT
              || !structureIdle(factory)){
                return;
            }

            var droidBody = bodies[Math.floor(Math.random() * bodies.length)];
            var droidPropulsion = propulsion[Math.floor(Math.random() * propulsion.length)];
            var droidWeapon1 = droidBody === 'Body14SUP'
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
        });
    }

    var attacking = false;
    playerData.forEach(function(player, id){
        if(attacking
          || groupSize(groupAttack) < minCyborgsAttack
          || allianceExistsBetween(me, id)){
            return;
        }

        if(groupSize(groupAttack) >= minCyborgsAttackStructures){
            var enemyList = [
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
            ];
            for(var enemy in enemyList){
                var enemies = enumStruct(
                  id,
                  enemyList[enemy],
                  me
                );
                if(enemies.length > 0){
                    attack(
                      groupAttack,
                      enemies[enemies.length - 1],
                      true
                    );
                    attacking = true;
                    return;
                }
            }
        }

        var droids = enumDroid(
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
    var research = enumResearch();

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
        var targetResearch = getResearch('R-Sys-Autorepair-General');

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

var groupAttack = newGroup();
var groupDefend = newGroup();
var limitCyborgsAttack = 40;
var maxConstructionDroids = 3;
var maxCyborgsDefend = 30;
var maxDefenseStructures = 3;
var minCyborgsAttack = 10;
var minCyborgsAttackStructures = 40;
var productionBegin = false;
var researchRandom = false;

var researchOrder = [
  'R-Sys-Engineering01',
  'R-Vehicle-Engine01',
  'R-Struc-Factory-Cyborg',
  'R-Sys-Sensor-Turret01',
  'R-Wpn-MG1Mk1',
  'R-Wpn-Flamer01Mk1',
  'R-Sys-Sensor-Tower01',
  'R-Struc-PowerModuleMk1',
  'R-Struc-CommandRelay',
  'R-Struc-Research-Module',
  'R-Struc-Research-Upgrade01',
  'R-Struc-Research-Upgrade02',
  'R-Struc-Research-Upgrade03',
  'R-Struc-Research-Upgrade04',
  'R-Struc-Power-Upgrade01',
  'R-Struc-Research-Upgrade05',
  'R-Struc-Power-Upgrade01b',
  'R-Struc-Research-Upgrade06',
  'R-Struc-Power-Upgrade01c',
  'R-Struc-Research-Upgrade07',
  'R-Struc-Power-Upgrade02',
  'R-Struc-Research-Upgrade08',
  'R-Struc-Power-Upgrade03',
  'R-Struc-Research-Upgrade09',
  'R-Struc-Power-Upgrade03a',
  'R-Sys-Autorepair-General',
];
