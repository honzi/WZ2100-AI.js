function buildOrder(){
    // Check module need.
    var powerModuleNeeded = checkNeedPowerModule();
    var researchModuleNeeded = checkNeedResearchModule();

    // Give orders to idle Cyborg Factories.
    var cyborgFactories = enumStruct(
      me,
      "A0CyborgFactory",
      me
    );
    cyborgFactories.some(function check_cyborgFactory(checked_cyborgFactory){
        if(checked_cyborgFactory.status == BUILT
          && structureIdle(checked_cyborgFactory)){
            buildDroid(
              checked_cyborgFactory,
              "cyborg",
              "Cyb-Chain-GROUND",
              "CyborgLegs",
              "",
              DROID_CYBORG,
              "CyborgChaingun"
            );
        }
    });

    // Give orders to idle Cyborgs.
    var cyborgs = enumDroid(
      me,
      DROID_CYBORG,
      me
    );
    cyborgs.some(function check_cyborg_idle(checked_cyborg){
        if(checked_droid.order !== DORDER_ATTACK){
            orderDroidLoc(
              checked_cyborg,
              DORDER_ATTACK,
              checked_cyborg.x,
              checked_cyborg.y
            );
        }
    });

    // Give orders to idle construction droids.
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT,
      me
    );
    droids.some(function check_droid_idle(checked_droid){
        if(checkDroidIdle(checked_droid)){
            var structures = enumStruct(me);
            var unfinished = false;

            for(var structure in structures){
                if(structures[structure].status !== BUILT){
                    unfinished = true;

                    orderDroidObj(
                      checked_droid,
                      DORDER_HELPBUILD,
                      structures[structure]
                    );

                    break;
                }
            }

            if(unfinished){
                return;
            }

            // Build 1 Research Facility.
            if(checkStructure(
                "A0ResearchFacility",
                1
              )){
                buildStructure(
                  checked_droid,
                  "A0ResearchFacility"
                );

            // Build 1 Power Generator.
            }else if(checkStructure(
                "A0PowerGenerator",
                1
              )){
                buildStructure(
                  checked_droid,
                  "A0PowerGenerator"
                );

            // Build 4 Resource Extractors.
            }else if(checkStructure(
                "A0ResourceExtractor",
                4
              )){
                buildStructure(
                  checked_droid,
                  "A0ResourceExtractor"
                );

            // Build as many Research Facilities as possible.
            }else if(checkStructure(
                "A0ResearchFacility",
                limitResearchFacilities
              )){
                buildStructure(
                  checked_droid,
                  "A0ResearchFacility"
                );

            // Build 1 Command Center.
            }else if(checkStructure(
                "A0CommandCentre",
                1
              )){
                buildStructure(
                  checked_droid,
                  "A0CommandCentre"
                );

            // Build as many Cyborg Factories as possible.
            }else if(checkStructure(
                "A0CyborgFactory",
                limitCyborgFactories
              )){
                buildStructure(
                  checked_droid,
                  "A0CyborgFactory"
                );

            // Build Power Modules.
            }else if(powerModuleNeeded !== false){
                buildStructure(
                  checked_droid,
                  "A0PowMod1",
                  powerModuleNeeded.x,
                  powerModuleNeeded.y
                );

            // Build Research Modules.
            }else if(researchModuleNeeded !== false){
                buildStructure(
                  checked_droid,
                  "A0ResearchModule1",
                  researchModuleNeeded.x,
                  researchModuleNeeded.y
                );
            }
        }
    });

    // Give orders to idle Research Facilities.
    var researchFacilities = enumStruct(
      me,
      "A0ResearchFacility",
      me
    );
    researchFacilities.some(function check_researchFacility_idle(checked_researchFacility){
        if(checked_researchFacility.status == BUILT
          && structureIdle(checked_researchFacility)){
            // Pursue research.
            pursueResearch(
              checked_researchFacility,
              researchOrder
            );
        }
    });

    // Make sure we have at least 2 construction droids.
    if(droids.length < 2){
        var factories = enumStruct(
          me,
          "A0LightFactory",
          me
        );

        if(factories.length > 0
          && structureIdle(factories[0])){
            buildDroid(
              factories[0],
              "Drone",
              "Body1REC",
              "wheeled01",
              "",
              DROID_CONSTRUCT,
              "Spade1Mk1"
            );
        }
    }

    queue(
      "buildOrder",
      0
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
          location.y
        );
    }
}

function checkDroidIdle(droid){
    return !(droid.order === DORDER_BUILD
      || droid.order === DORDER_HELPBUILD);
}

function checkNeedPowerModule(){
    if(isStructureAvailable(
        "A0PowMod1",
        me
      )){
        var powerGenerators = enumStruct(
          me,
          "A0PowerGenerator",
          me
        ).reverse();
        var generator = false;
        powerGenerators.some(function check_powerGenerator_needmodule(checked_powerGenerator){
            if(checked_powerGenerator.modules == 0){
                generator = checked_powerGenerator;
                return true;
            }
        });

        if(generator !== false){
            return generator;
        }
    }

    return false;
}

function checkNeedResearchModule(){
    if(isStructureAvailable(
        "A0ResearchModule1",
        me
      )){
        var researchFacilities = enumStruct(
          me,
          "A0ResearchFacility",
          me
        ).reverse();
        var facility = false;
        researchFacilities.some(function check_researchFacility_needmodule(checked_researchFacility){
            if(checked_researchFacility.modules == 0){
                facility = checked_researchFacility;
                return true;
            }
        });

        if(facility !== false){
            return facility;
        }
    }

    return false;
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
}

function eventGameLoaded(){
    init();
}

function eventStartLevel(){
    init();
}

function init(){
    // Get limitations.
    limitCyborgFactories = getStructureLimit(
      "A0CyborgFactory",
      me
    );
    limitResearchFacilities = getStructureLimit(
      "A0ResearchFacility",
      me
    );

    // Start build order loop.
    queue(
      "buildOrder",
      0
    );
}

var limitCyborgFactories = 5;
var limitResearchFacilities = 5;
const researchOrder = [
  "R-Sys-Engineering01",        // Engineering
  "R-Vehicle-Engine01",         // Fuel Injection Engine
  "R-Struc-Factory-Cyborg",     // Cyborg Factory
  "R-Sys-Sensor-Turret01",      // Sensor Turret
  "R-Wpn-MG1Mk1",               // Machinegun
  "R-Sys-Sensor-Tower01",       // Sensor Tower
  "R-Struc-PowerModuleMk1",     // Power Module
  "R-Struc-CommandRelay",       // Command Relay Post
  "R-Struc-Research-Module",    // Research Module
  "R-Struc-Research-Upgrade01", // Synaptic Link Data Analysis
  "R-Struc-Research-Upgrade02", // Synaptic Link Data Analysis Mk2
  "R-Struc-Research-Upgrade03", // Synaptic Link Data Analysis Mk3
  "R-Struc-Research-Upgrade04", // Dedicated Synaptic Link Data Analysis
  "R-Struc-Power-Upgrade01",    // Gas Turbine Generator
  "R-Struc-Research-Upgrade05", // Dedicated Synaptic Link Data Analysis Mk2
  "R-Struc-Power-Upgrade01b",   // Gas Turbine Generator Mk2
  "R-Struc-Research-Upgrade06", // Dedicated Synaptic Link Data Analysis Mk3
  "R-Struc-Power-Upgrade01c",   // Gas Turbine Generator Mk3
  "R-Struc-Research-Upgrade07", // Neural Synapse Research Brain
  "R-Struc-Power-Upgrade02",    // Vapor Turbine Generator
  "R-Struc-Research-Upgrade08", // Neural Synapse Research Brain Mk2
  "R-Struc-Power-Upgrade03",    // Vapor Turbine Generator Mk2
  "R-Struc-Research-Upgrade09", // Neural Synapse Research Brain Mk3
  "R-Struc-Power-Upgrade03a",   // Vapor Turbine Generator Mk3
  "R-Sys-Autorepair-General",   // Auto-Repair
];
