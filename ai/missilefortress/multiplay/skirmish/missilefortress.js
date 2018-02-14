function buildOrder(){
    // Check module need.
    var powerModuleNeeded = checkNeedPowerModule();
    var researchModuleNeeded = checkNeedResearchModule();

    // Give orders to idle construction droids.
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT,
      me
    );
    droids.some(function check_droid_idle(checked_droid){
        if(checked_droid.order !== DORDER_BUILD){
            // Build one Research Facility.
            if(checkStructure(
              "A0ResearchFacility",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0ResearchFacility"
                );

            // Build one Power Generator.
            }else if(checkStructure(
              "A0PowerGenerator",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0PowerGenerator"
                );

            // Build four Resource Extractors.
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

            // Build one Command Center.
            }else if(checkStructure(
              "A0CommandCentre",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0CommandCentre"
                );

            // Build one Factory.
            }else if(checkStructure(
              "A0LightFactory",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0LightFactory"
                );

            // Build one Repair Facility.
            }else if(checkStructure(
              "A0RepairCentre3",
              1
            )){
                buildStructure(
                  checked_droid,
                  "A0RepairCentre3"
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

            // Build many Missile Fortresses.
            }else if(isStructureAvailable(
              "X-Super-Missile",
              me
            )){
                buildStructure(
                  checked_droid,
                  "X-Super-Missile"
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
        if(checked_researchFacility.status == BUILT && structureIdle(checked_researchFacility)){
            // Pursue research.
            pursueResearch(
              checked_researchFacility,
              researchOrder
            );
        }
    });

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

var limitResearchFacilities = 5;
const researchOrder = [
  "R-Sys-Engineering01",         // Engineering
  "R-Vehicle-Engine01",          // Fuel Injection Engine
  "R-Sys-Sensor-Turret01",       // Sensor Turret
  "R-Defense-HardcreteWall",     // Hardcrete Wall
  "R-Defense-WallUpgrade01",     // Improved Hardcrete
  "R-Sys-Sensor-Tower01",        // Sensor Tower
  "R-Struc-PowerModuleMk1",      // Power Module
  "R-Wpn-Rocket05-MiniPod",      // Mini-Rocket Pod
  "R-Struc-CommandRelay",        // Command Relay Post
  "R-Defense-WallUpgrade02",     // Improved Hardcrete Mk2
  "R-Wpn-Rocket-Damage01",       // HE Rockets
  "R-Struc-Research-Module",     // Research Module
  "R-Wpn-Rocket-Damage02",       // HE Rockets Mk2
  "R-Struc-Research-Upgrade01",  // Synaptic Link Data Analysis
  "R-Defense-WallUpgrade03",     // Improved Hardcrete Mk3
  "R-Struc-Research-Upgrade02",  // Synaptic Link Data Analysis Mk2
  "R-Wpn-Rocket-Damage03",       // HE Rockets Mk3
  "R-Wpn-Rocket-Accuracy01",     // Stabilized Rockets
  "R-Struc-Research-Upgrade03",  // Synaptic Link Data Analysis Mk3
  "R-Wpn-Rocket01-LtAT",         // Lancer AT Rocket
  "R-Struc-Research-Upgrade04",  // Dedicated Synaptic Link Data Analysis
  "R-Wpn-Rocket-Damage04",       // HEAT Rocket Warhead
  "R-Struc-Power-Upgrade01",     // Gas Turbine Generator
  "R-Struc-Research-Upgrade05",  // Dedicated Synaptic Link Data Analysis Mk2
  "R-Wpn-Rocket-Damage05",       // HEAT Rocket Warhead Mk2
  "R-Sys-Engineering02",         // Improved Engineering
  "R-Struc-Power-Upgrade01b",    // Gas Turbine Generator Mk2
  "R-Struc-Research-Upgrade06",  // Dedicated Synaptic Link Data Analysis Mk3
  "R-Defense-WallUpgrade04",     // Supercrete
  "R-Struc-Power-Upgrade01c",    // Gas Turbine Generator Mk3
  "R-Struc-Research-Upgrade07",  // Neural Synapse Research Brain
  "R-Struc-Power-Upgrade02",     // Vapor Turbine Generator
  "R-Wpn-Rocket-Accuracy02",     // Improved Rocket Wire Guidance
  "R-Struc-Research-Upgrade08",  // Neural Synapse Research Brain Mk2
  "R-Struc-Power-Upgrade03",     // Vapor Turbine Generator Mk2
  "R-Defense-WallUpgrade05",     // Supercrete Mk2
  "R-Struc-Research-Upgrade09",  // Neural Synapse Research Brain Mk3
  "R-Struc-Power-Upgrade03a",    // Vapor Turbine Generator Mk3
  "R-Wpn-RocketSlow-Accuracy01", // Rocket Laser Designator
  "R-Wpn-Rocket-Damage06",       // HEAT Rocket Warhead Mk3
  "R-Wpn-RocketSlow-Accuracy02", // Thermal Imaging Rockets
  "R-Wpn-Rocket07-Tank-Killer",  // Tank Killer Rocket
  "R-Defense-WallUpgrade06",     // Supercrete Mk3
  "R-Sys-Engineering03",         // Advanced Engineering
  "R-Wpn-Missile2A-T",           // Scourge Missile
  "R-Defense-WallUpgrade07",     // Plascrete
  "R-Wpn-Missile-ROF01",         // Advanced Missile Allocation System
  "R-Defense-WallUpgrade08",     // Plascrete Mk2
  "R-Wpn-Missile-ROF02",         // Advanced Missile Allocation System Mk2
  "R-Defense-WallUpgrade09",     // Plascrete Mk3
  "R-Wpn-Missile-ROF03",         // Advanced Missile Allocation System Mk3
  "R-Defense-WallUpgrade10",     // Plasteel
  "R-Defense-Super-Missile",     // Missile Fortress
  "R-Wpn-Missile-Damage01",      // Advanced Missile Warhead
  "R-Sys-Autorepair-General",    // Auto-Repair
  "R-Sys-Sensor-Upgrade01",      // Sensor Upgrade
  "R-Struc-Materials01",         // Reinforced Base Structure Materials
  "R-Struc-Factory-Cyborg",      // Cyborg Factory
  "R-Sys-MobileRepairTurret01",  // Mobile Repair Turret
  "R-Sys-Sensor-Upgrade02",      // Sensor Upgrade Mk2
  "R-Struc-Materials02",         // Reinforced Base Structure Materials Mk2
  "R-Struc-Factory-Module",      // Factory Module
  "R-Vehicle-Metals01",          // Composite Alloys Mk1
  "R-Struc-Materials03",         // Reinforced Base Structure Materials Mk3
  "R-Struc-RepairFacility",      // Repair Facility
  "R-Sys-Sensor-Upgrade03",      // Sensor Upgrade Mk3
  "R-Wpn-Missile-Accuracy01",    // Target Prediction Missiles
  "R-Struc-Factory-Upgrade01",   // Automated Manufacturing
  "R-Vehicle-Metals01",          // Composite Alloys
  "R-Defense-WallUpgrade11",     // Plasteel Mk2
  "R-Wpn-Missile-Damage01",      // Advanced Missile Warhead Mk2
  "R-Vehicle-Metals02",          // Composite Alloys Mk2
  "R-Struc-Materials04",         // Hardened Base Structure Materials
  "R-Struc-Materials05",         // Hardened Base Structure Materials Mk2
  "R-Vehicle-Metals03",          // Composite Alloys Mk3
  "R-Struc-Materials06",         // Hardened Base Structure Materials Mk3
  "R-Wpn-Missile-Accuracy02",    // Search & Destroy Missiles
  "R-Defense-WallUpgrade12",     // Plasteel Mk3
  "R-Struc-Materials07",         // Advanced Base Structure Materials
  "R-Struc-Materials08",         // Advanced Base Structure Materials Mk2
  "R-Wpn-Missile-Damage03",      // Advanced Missile Warhead Mk3
  "R-Struc-Materials09",         // Advanced Base Structure Materials Mk3
  "R-Struc-RprFac-Upgrade06",    // Advanced Repair Facility
  "R-Vehicle-Armor-Heat01",      // Thermal Armor
  "R-Vehicle-Metals09",          // Superdense Composite Alloys Mk3
  "R-Vehicle-Armor-Heat09",      // Vehicle Superdense Thermal Armor Mk3
];
