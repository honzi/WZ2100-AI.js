function attack(enemy){
    var cyborgs = enumDroid(me);

    for(var cyborg in cyborgs){
        if(cyborgs[cyborg].droidType === DROID_CONSTRUCT){
            continue;
        }

        // Return cyborgs to base if we don't have enough.
        if(cyborgs.length < minCyborgs){
            orderDroid(
              cyborgs[cyborg],
              DORDER_RTB
            );
            continue;
        }

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
      DROID_CONSTRUCT,
      me
    );
    const droidCount = droids.length;
    var powerModuleNeeded = checkNeedPowerModule();
    var researchModuleNeeded = checkNeedResearchModule();
    var structures = enumStruct(me);

    // If production has begun, give orders to idle Cyborg Factories.
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

    // Give orders to construction droids.
    droids.some(function check_droid(droid){
        const isProjectManager = droid === droids[droidCount - 1];

        // Chores for regular construction droids.
        // Project manager must do these if nobody else can.
        if(!isProjectManager
          || droidCount <= 1){
            for(var structure in structures){
                // Repair damaged structures.
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

        // Chores for all construction droids.
        for(var structure in structures){
            // Finish incomplete structures.
            if(structures[structure].status !== BUILT){
                orderDroidObj(
                  droid,
                  DORDER_HELPBUILD,
                  structures[structure]
                );

                return;
            }
        }

        // Only project managers get to decide where to build.
        if(!isProjectManager){
            return;
        }

        // Build 1 Research Facility.
        if(checkStructure(
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        // Build 1 Power Generator.
        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              droid,
              'A0PowerGenerator'
            );

        // Build Resource Extractors.
        }else if(checkStructure(
            'A0ResourceExtractor',
            maxResourceExtractors
          )){
            buildStructure(
              droid,
              'A0ResourceExtractor'
            );

        // Build Research Facilities.
        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              droid,
              'A0ResearchFacility'
            );

        // Build Factories.
        }else if(checkStructure(
            'A0LightFactory',
            maxFactories
          )){
            buildStructure(
              droid,
              'A0LightFactory'
            );

        // Build Cyborg Factories.
        }else if(checkStructure(
            'A0CyborgFactory',
            maxCyborgFactories
          )){
            buildStructure(
              droid,
              'A0CyborgFactory'
            );

        // Build 1 Command Center.
        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              droid,
              'A0CommandCentre'
            );

        // Build Power Modules.
        }else if(powerModuleNeeded !== false){
            buildStructure(
              droid,
              'A0PowMod1',
              powerModuleNeeded.x,
              powerModuleNeeded.y
            );

        // Build Research Modules.
        }else if(researchModuleNeeded !== false){
            buildStructure(
              droid,
              'A0ResearchModule1',
              researchModuleNeeded.x,
              researchModuleNeeded.y
            );
        }
    });

    // Give orders to idle Research Facilities if needed.
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

    // Make sure we have enough construction droids.
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

    // Cyborgs attack visible enemies.
    playerData.forEach(function(player, id){
        if(allianceExistsBetween(me, id)){
            return;
        }

        // First check for droids.
        var droids = enumDroid(
          id,
          DROID_ANY,
          me
        );
        if(droids.length > 0){
            attack(droids[droids.length - 1]);
            return;
        }

        // Then check for structures if we have enough cyborgs.
        if(droidCount < minCyborgsStructs){
            return;
        }
        const enemyList = [
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
                attack(enemies[enemies.length - 1]);
                return;
            }
        }
    });

    queue(
      'buildOrder',
      queueTimer
    );
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

function checkNeedPowerModule(){
    if(!isStructureAvailable(
        'A0PowMod1',
        me
      )){
        return false;
    }

    var generator = false;
    var powerGenerators = enumStruct(
      me,
      'A0PowerGenerator',
      me
    ).reverse();
    powerGenerators.some(function check_powerGenerator(powerGenerator){
        if(powerGenerator.modules !== 0){
            return;
        }

        generator = powerGenerator;
    });

    return generator;
}

function checkNeedResearchModule(){
    if(!isStructureAvailable(
        'A0ResearchModule1',
        me
      )){
         false;
    }

    var facility = false;
    var researchFacilities = enumStruct(
      me,
      'A0ResearchFacility',
      me
    ).reverse();
    researchFacilities.some(function check_researchFacility(researchFacility){
        if(researchFacility.modules !== 0){
            return;
        }

        facility = researchFacility;
    });

    return facility;
}

function checkStructure(structure, count){
    return isStructureAvailable(
      structure,
      me
    ) && countStruct(structure) < count;
}

function eventAttacked(victim, attacker){
    if(me !== victim.player){
        return;
    }

    attack(attacker);
    productionBegin = true;
}

function eventGameLoaded(){
    init();
}

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    const cyborgWeaponResearch = {
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

    // Modify strategy when research order is done.
    if(research.name === researchOrder[researchOrder.length - 1]){
        productionBegin = true;
        researchRandom = true;

    // Add weapons to use when they are researched.
    }else if(cyborgWeaponResearch[research.name]){
        cyborgWeapons.push(cyborgWeaponResearch[research.name]);
    }
}

function eventStartLevel(){
    init();
}

function init(){
    // Get limitations.
    maxCyborgFactories = getStructureLimit(
      'A0CyborgFactory',
      me
    );
    maxResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );

    // Start build order loop.
    queue(
      'buildOrder',
      0
    );

    // Start randomLocation() loop.
    queue(
      'randomLocation',
      randomLocationTimer
    );
}

function randomLocation(){
    var cyborgs = enumDroid(me);

    if(cyborgs.length < minCyborgsStructs){
        return;
    }

    for(var cyborg in cyborgs){
        if(cyborgs[cyborg].droidType === DROID_CONSTRUCT){
            continue;
        }

        orderDroidLoc(
          cyborgs[cyborg],
          DORDER_SCOUT,
          Math.floor(Math.random() * mapWidth),
          Math.floor(Math.random() * mapHeight)
        );
    }

    queue(
      'randomLocation',
      randomLocationTimer
    );
}

function randomResearch(){
    const research = enumResearch();

    // Modify strategy when all research is done.
    if(research.length === 0){
        maxConstructionDroids = 5;
        maxResearchFacilities = 1;
        researchDone = true;
        return;
    }

    return [research[Math.floor(Math.random() * research.length)].name];
}

var cyborgWeapons = [];
var maxConstructionDroids = 2;
var maxCyborgFactories = 5;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var minCyborgs = 20;
var minCyborgsStructs = 64;
var productionBegin = false;
var queueTimer = 1000;
var randomLocationTimer = 60000; // 60 seconds
var researchDone = false;
var researchRandom = false;

const researchOrder = [
  'R-Sys-Engineering01',        // Engineering
  'R-Vehicle-Engine01',         // Fuel Injection Engine
  'R-Struc-Factory-Cyborg',     // Cyborg Factory
  'R-Sys-Sensor-Turret01',      // Sensor Turret
  'R-Wpn-MG1Mk1',               // Machinegun
  'R-Wpn-Flamer01Mk1',          // Flamer
  'R-Sys-Sensor-Tower01',       // Sensor Tower
  'R-Struc-PowerModuleMk1',     // Power Module
  'R-Struc-CommandRelay',       // Command Relay Post
  'R-Struc-Research-Module',    // Research Module
  'R-Struc-Research-Upgrade01', // Synaptic Link Data Analysis
  'R-Struc-Research-Upgrade02', // Synaptic Link Data Analysis Mk2
  'R-Struc-Research-Upgrade03', // Synaptic Link Data Analysis Mk3
  'R-Struc-Research-Upgrade04', // Dedicated Synaptic Link Data Analysis
  'R-Struc-Power-Upgrade01',    // Gas Turbine Generator
  'R-Struc-Research-Upgrade05', // Dedicated Synaptic Link Data Analysis Mk2
  'R-Struc-Power-Upgrade01b',   // Gas Turbine Generator Mk2
  'R-Struc-Research-Upgrade06', // Dedicated Synaptic Link Data Analysis Mk3
  'R-Struc-Power-Upgrade01c',   // Gas Turbine Generator Mk3
  'R-Struc-Research-Upgrade07', // Neural Synapse Research Brain
  'R-Struc-Power-Upgrade02',    // Vapor Turbine Generator
  'R-Struc-Research-Upgrade08', // Neural Synapse Research Brain Mk2
  'R-Struc-Power-Upgrade03',    // Vapor Turbine Generator Mk2
  'R-Struc-Research-Upgrade09', // Neural Synapse Research Brain Mk3
  'R-Struc-Power-Upgrade03a',   // Vapor Turbine Generator Mk3
  'R-Sys-Autorepair-General',   // Auto-Repair
];
