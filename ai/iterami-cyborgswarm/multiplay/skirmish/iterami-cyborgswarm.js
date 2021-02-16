function attack(enemy, structureAttacked){
    var cyborgs = enumDroid(
      me,
      DROID_CYBORG
    );
    if(!structureAttacked
      && cyborgs.length < minCyborgs){
        return;
    }

    for(var cyborg in cyborgs){
        if(enemy.type === DROID){
            if(enemy.isVTOL){
                if(!cyborgs[cyborg].canHitAir){
                    continue;
                }

            }else if(!cyborgs[cyborg].canHitGround){
                continue;
            }
        }

        orderDroidLoc(
          cyborgs[cyborg],
          DORDER_SCOUT,
          enemy.x,
          enemy.y
        );
    }
}

function buildOrder(){
    setMiniMap(true);

    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var droidCount = droids.length;
    var lessThan2 = droidCount < 2;
    var structures = enumStruct(me);

    if(productionBegin){
        var cyborgFactories = enumStruct(
          me,
          'A0CyborgFactory',
          me
        );
        cyborgFactories.some(function check_cyborgFactory(cyborgFactory){
            if(cyborgFactory.status !== BUILT
              || !structureIdle(cyborgFactory)
              || cyborgWeapons.length === 0){
                return;
            }

            buildDroid(
              cyborgFactory,
              'cyborg',
              'CyborgLightBody',
              'CyborgLegs',
              '',
              DROID_CYBORG,
              cyborgWeapons[Math.floor(Math.random() * cyborgWeapons.length)]
            );
        });
    }

    droids.some(function check_droid(droid){
        var isProjectManager = droid === droids[droidCount - 1];

        if(!isProjectManager
          || lessThan2){
            for(var structure in structures){
                if(structures[structure].health < 100
                  && structures[structure].status === BUILT){
                    if(droid.order !== DORDER_REPAIR){
                        orderDroidObj(
                          droid,
                          DORDER_REPAIR,
                          structures[structure]
                        );
                    }

                    return;
                }
            }
        }

        if(droid.order === DORDER_BUILD
          || droid.order === DORDER_HELPBUILD){
            return;
        }

        for(var structure in structures){
            if(structures[structure].status !== BUILT){
                orderDroidObj(
                  droid,
                  DORDER_HELPBUILD,
                  structures[structure]
                );

                return;
            }
        }

        if(!isProjectManager){
            return;
        }

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

        }else if(powerModuleNeeded !== false){
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
        }
    });

    if(!researchDone){
        var researchFacilities = enumStruct(
          me,
          'A0ResearchFacility',
          me
        );
        researchFacilities.some(function check_researchFacility(researchFacility){
            if(researchFacility.status !== BUILT
              || !structureIdle(researchFacility)){
                return;
            }

            pursueResearch(
              researchFacility,
              researchRandom
                ? randomResearch()
                : researchOrder
            );
        });
    }

    if(droidCount < maxConstructionDroids){
        var factories = enumStruct(
          me,
          'A0LightFactory',
          me
        );
        factories.some(function check_factory(factory){
            if(factory.status !== BUILT
              || !structureIdle(factory)){
                return;
            }

            buildDroid(
              factory,
              'Drone',
              'Body1REC',
              'wheeled01',
              '',
              DROID_CONSTRUCT,
              'Spade1Mk1'
            );
        });
    }

    var attacking = false;
    playerData.forEach(function(player, id){
        if(attacking
          || allianceExistsBetween(me, id)){
            return;
        }

        if(enumDroid(
            me,
            DROID_CYBORG
          ).length >= minCyborgsStructs){
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
                      enemies[enemies.length - 1],
                      false
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
              droids[droids.length - 1],
              false
            );
            attacking = true;
            return;
        }
    });
}

function buildStructure(droid, structure, x, y){
    x = x || droid.x;
    y = y || droid.y;

    var location = pickStructLocation(
      droid,
      structure,
      x,
      y
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

function checkNeedModule(structure, module, count){
    if(!isStructureAvailable(
        module,
        me
      )){
        return false;
    }

    var moduleNeeded = false;
    var structures = enumStruct(
      me,
      structure
    );
    structures.some(function check_structure(checkedStructure){
        if(checkedStructure.modules >= count){
            return;
        }

        moduleNeeded = checkedStructure;
    });

    return moduleNeeded;
}

function checkStructure(structure, count){
    return isStructureAvailable(
      structure,
      me
    ) && countStruct(structure) < count;
}

function eventAttacked(victim, attacker){
    if(me !== victim.player
      || victim.type !== STRUCTURE){
        return;
    }

    attack(
      attacker,
      true
    );
    productionBegin = true;
}

function eventGameLoaded(){
    init();
}

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    var cyborgWeaponResearch = {
      'R-Wpn-Cannon1Mk1': 'CyborgCannon',
      'R-Wpn-Flamer01Mk1': 'CyborgFlamer01',
      'R-Wpn-Laser01': 'Cyb-Wpn-Laser',
      'R-Wpn-MG1Mk1': 'CyborgChaingun',
      'R-Wpn-MG4': 'CyborgRotMG',
      'R-Wpn-Missile2A-T': 'Cyb-Wpn-Atmiss',
      'R-Wpn-Mortar01Lt': 'Cyb-Wpn-Grenade',
      'R-Wpn-RailGun01': 'Cyb-Wpn-Rail1',
      'R-Wpn-Rocket01-LtAT': 'CyborgRocket',
    };

    if(research.name === researchOrder[researchOrder.length - 1]){
        productionBegin = true;
        researchRandom = true;

    }else if(cyborgWeaponResearch[research.name]){
        cyborgWeapons.push(cyborgWeaponResearch[research.name]);
    }
}

function eventStartLevel(){
    init();
}

function init(){
    maxCyborgFactories = getStructureLimit(
      'A0CyborgFactory',
      me
    );
    maxResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );

    setTimer(
      'buildOrder',
      timerBuildOrder
    );
    buildOrder();
    setTimer(
      'randomLocation',
      timerRandomLocation
    );
}

function randomLocation(){
    var cyborgs = enumDroid(
      me,
      DROID_CYBORG
    );

    if(cyborgs.length >= minCyborgsStructs){
        for(var cyborg in cyborgs){
            orderDroidLoc(
              cyborgs[cyborg],
              DORDER_SCOUT,
              Math.floor(Math.random() * mapWidth),
              Math.floor(Math.random() * mapHeight)
            );
        }
    }
}

function randomResearch(){
    var research = enumResearch();

    if(research.length === 0){
        maxConstructionDroids = 5;
        maxResearchFacilities = 1;
        researchDone = true;
        return;
    }

    return research[Math.floor(Math.random() * research.length)].name;
}

var cyborgWeapons = [];
var maxConstructionDroids = 2;
var maxCyborgFactories = 5;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var minCyborgs = 15;
var minCyborgsStructs = 50;
var productionBegin = false;
var researchDone = false;
var researchRandom = false;
var timerBuildOrder = 1000;
var timerRandomLocation = 60000;

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
