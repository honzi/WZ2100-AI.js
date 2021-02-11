function attack(enemy){
    var cyborgs = enumDroid(me);

    for(var cyborg in cyborgs){
        if(cyborgs[cyborg].droidType !== DROID_CONSTRUCT){
            orderDroidLoc(
              cyborgs[cyborg],
              DORDER_SCOUT,
              enemy.x,
              enemy.y
            );
        }
    }
}

function buildOrder(){
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
              || !structureIdle(cyborgFactory)){
                return;
            }

            buildDroid(
              cyborgFactory,
              'cyborg',
              'CyborgLightBody',
              'CyborgLegs',
              '',
              DROID_CYBORG,
              'CyborgChaingun'
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
              researchOrder
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

    // Cyborgs attack visible enemy droids.
    playerData.forEach(function(player, id){
        if(allianceExistsBetween(me, id)){
            return;
        }

        var enemies = enumDroid(
          id,
          DROID_ANY,
          me
        );
        if(enemies.length > 0){
            attack(enemies[0]);
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
        return false;
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

    if(research.name === researchOrder[researchOrder.length - 1]){
        maxConstructionDroids = 5;
        maxResearchFacilities = 1;
        researchDone = true;

    }else if(research.name === 'R-Sys-Autorepair-General'){
        productionBegin = true;
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
}

var maxConstructionDroids = 2;
var maxCyborgFactories = 5;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var productionBegin = false;
var queueTimer = 1000;
var researchDone = false;

const researchOrder = [
  'R-Sys-Engineering01',        // Engineering
  'R-Vehicle-Engine01',         // Fuel Injection Engine
  'R-Struc-Factory-Cyborg',     // Cyborg Factory
  'R-Sys-Sensor-Turret01',      // Sensor Turret
  'R-Wpn-MG1Mk1',               // Machinegun
  'R-Sys-Sensor-Tower01',       // Sensor Tower
  'R-Struc-PowerModuleMk1',     // Power Module
  'R-Struc-CommandRelay',       // Command Relay Post
  'R-Struc-Research-Module',    // Research Module
  'R-Wpn-MG-Damage01',          // Hardened MG Bullets
  'R-Struc-Research-Upgrade01', // Synaptic Link Data Analysis
  'R-Wpn-MG-Damage02',          // APDSB MG Bullets
  'R-Struc-Research-Upgrade02', // Synaptic Link Data Analysis Mk2
  'R-Wpn-MG-Damage03',          // APDSB MG Bullets Mk2
  'R-Struc-Research-Upgrade03', // Synaptic Link Data Analysis Mk3
  'R-Wpn-MG-Damage04',          // APDSB MG Bullets Mk3
  'R-Struc-Research-Upgrade04', // Dedicated Synaptic Link Data Analysis
  'R-Struc-Power-Upgrade01',    // Gas Turbine Generator
  'R-Struc-Research-Upgrade05', // Dedicated Synaptic Link Data Analysis Mk2
  'R-Struc-Power-Upgrade01b',   // Gas Turbine Generator Mk2
  'R-Struc-Research-Upgrade06', // Dedicated Synaptic Link Data Analysis Mk3
  'R-Struc-Power-Upgrade01c',   // Gas Turbine Generator Mk3
  'R-Struc-Research-Upgrade07', // Neural Synapse Research Brain
  'R-Struc-Power-Upgrade02',    // Vapor Turbine Generator
  'R-Struc-Research-Upgrade08', // Neural Synapse Research Brain Mk2
  'R-Sys-Autorepair-General',   // Auto-Repair
  'R-Struc-Power-Upgrade03',    // Vapor Turbine Generator Mk2
  'R-Struc-Research-Upgrade09', // Neural Synapse Research Brain Mk3
  'R-Struc-Power-Upgrade03a',   // Vapor Turbine Generator Mk3
  'R-Wpn-MG-Damage05',          // Depleted Uranium MG Bullets
  'R-Struc-Factory-Upgrade01',  // Automated Manufacturing
  'R-Wpn-MG-Damage06',          // Depleted Uranium MG Bullets
  'R-Cyborg-Metals01',          // Cyborg Composite Alloys
  'R-Struc-Factory-Upgrade04',  // Robotic Manufacturing
  'R-Wpn-MG-Damage07',          // Depleted Uranium MG Bullets
  'R-Cyborg-Metals02',          // Cyborg Composite Alloys Mk2
  'R-Wpn-MG-Damage08',          // Depleted Uranium MG Bullets
  'R-Struc-Factory-Upgrade07',  // Advanced Manufacturing
  'R-Cyborg-Metals03',          // Cyborg Composite Alloys Mk3
  'R-Struc-Factory-Upgrade09',  // Self-Replicating Manufacturing
  'R-Cyborg-Metals04',          // Cyborg Dense Composite Alloys
  'R-Cyborg-Armor-Heat01',      // Cyborg Thermal Armor
  'R-Cyborg-Armor-Heat02',      // Cyborg Thermal Armor Mk2
  'R-Cyborg-Metals05',          // Cyborg Dense Composite Alloys Mk2
  'R-Cyborg-Armor-Heat03',      // Cyborg Thermal Armor Mk3
  'R-Cyborg-Metals06',          // Cyborg Dense Composite Alloys Mk3
  'R-Cyborg-Armor-Heat04',      // Cyborg High Intensity Thermal Armor
  'R-Cyborg-Metals07',          // Cyborg Superdense Composite Alloys
  'R-Vehicle-Engine02',         // Fuel Injection Engine Mk2
  'R-Cyborg-Armor-Heat05',      // Cyborg High Intensity Thermal Armor Mk2
  'R-Cyborg-Metals08',          // Cyborg Superdense Composite Alloys Mk2
  'R-Cyborg-Armor-Heat05',      // Cyborg High Intensity Thermal Armor Mk3
  'R-Cyborg-Metals09',          // Cyborg Superdense Composite Alloys Mk3
  'R-Cyborg-Armor-Heat09',      // Cyborg Superdense Thermal Armor Mk3
  'R-Sys-Resistance-Circuits',  // Nexus Resistance Circuits
];
