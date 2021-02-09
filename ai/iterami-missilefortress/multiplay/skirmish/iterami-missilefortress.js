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
        if(!checkDroidIdle(checked_droid)){
            return;
        }

        // Finish incomplete buildings first.
        var structures = enumStruct(me);
        for(var structure in structures){
            if(structures[structure].status !== BUILT){
                orderDroidObj(
                  checked_droid,
                  DORDER_HELPBUILD,
                  structures[structure]
                );

                return;
            }
        }

        // Build 1 Research Facility.
        if(checkStructure(
            'A0ResearchFacility',
            1
          )){
            buildStructure(
              checked_droid,
              'A0ResearchFacility'
            );

        // Build 1 Power Generator.
        }else if(checkStructure(
            'A0PowerGenerator',
            1
          )){
            buildStructure(
              checked_droid,
              'A0PowerGenerator'
            );

        // Build Resource Extractors.
        }else if(checkStructure(
            'A0ResourceExtractor',
            maxResourceExtractors
          )){
            buildStructure(
              checked_droid,
              'A0ResourceExtractor'
            );

        // Build as many Research Facilities as possible.
        }else if(checkStructure(
            'A0ResearchFacility',
            maxResearchFacilities
          )){
            buildStructure(
              checked_droid,
              'A0ResearchFacility'
            );

        // Build 1 Command Center.
        }else if(checkStructure(
            'A0CommandCentre',
            1
          )){
            buildStructure(
              checked_droid,
              'A0CommandCentre'
            );

        // Build Factories.
        }else if(checkStructure(
            'A0LightFactory',
            maxFactories
          )){
            buildStructure(
              checked_droid,
              'A0LightFactory'
            );

        // Build Power Modules.
        }else if(powerModuleNeeded !== false){
            buildStructure(
              checked_droid,
              'A0PowMod1',
              powerModuleNeeded.x,
              powerModuleNeeded.y
            );

        // Build Research Modules.
        }else if(researchModuleNeeded !== false){
            buildStructure(
              checked_droid,
              'A0ResearchModule1',
              researchModuleNeeded.x,
              researchModuleNeeded.y
            );

        // Build many Missile Fortresses.
        }else if(isStructureAvailable(
            'X-Super-Missile',
            me
          )){
            buildStructure(
              checked_droid,
              'X-Super-Missile'
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
        researchFacilities.some(function check_researchFacility_idle(checked_researchFacility){
            if(checked_researchFacility.status !== BUILT
              || !structureIdle(checked_researchFacility)){
                return;
            }

            pursueResearch(
              checked_researchFacility,
              researchOrder
            );
        });
    }

    // Make sure we have enough construction droids.
    if(droids.length < maxConstructionDroids){
        var factories = enumStruct(
          me,
          'A0LightFactory',
          me
        );

        if(factories.length > 0
          && structureIdle(factories[0])){
            buildDroid(
              factories[0],
              'Drone',
              'Body1REC',
              'wheeled01',
              '',
              DROID_CONSTRUCT,
              'Spade1Mk1'
            );
        }
    }

    queue(
      'buildOrder',
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

    powerGenerators.some(function check_powerGenerator_needmodule(checked_powerGenerator){
        if(checked_powerGenerator.modules !== 0){
            return;
        }

        generator = checked_powerGenerator;
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

    researchFacilities.some(function check_researchFacility_needmodule(checked_researchFacility){
        if(checked_researchFacility.modules !== 0){
            return;
        }

        facility = checked_researchFacility;
    });

    return facility;
}

function checkStructure(structure, count){
    return isStructureAvailable(
      structure,
      me
    ) && countStruct(structure) < count;
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
        researchDone = true;
    }
}

function eventStartLevel(){
    init();
}

function init(){
    // Get limitations.
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
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var researchDone = false;
const researchOrder = [
  'R-Sys-Engineering01',         // Engineering
  'R-Vehicle-Engine01',          // Fuel Injection Engine
  'R-Sys-Sensor-Turret01',       // Sensor Turret
  'R-Defense-HardcreteWall',     // Hardcrete Wall
  'R-Defense-WallUpgrade01',     // Improved Hardcrete
  'R-Sys-Sensor-Tower01',        // Sensor Tower
  'R-Struc-PowerModuleMk1',      // Power Module
  'R-Wpn-Rocket05-MiniPod',      // Mini-Rocket Pod
  'R-Struc-CommandRelay',        // Command Relay Post
  'R-Defense-WallUpgrade02',     // Improved Hardcrete Mk2
  'R-Wpn-Rocket-Damage01',       // HE Rockets
  'R-Struc-Research-Module',     // Research Module
  'R-Wpn-Rocket-Damage02',       // HE Rockets Mk2
  'R-Struc-Research-Upgrade01',  // Synaptic Link Data Analysis
  'R-Defense-WallUpgrade03',     // Improved Hardcrete Mk3
  'R-Struc-Research-Upgrade02',  // Synaptic Link Data Analysis Mk2
  'R-Wpn-Rocket-Damage03',       // HE Rockets Mk3
  'R-Wpn-Rocket-Accuracy01',     // Stabilized Rockets
  'R-Struc-Research-Upgrade03',  // Synaptic Link Data Analysis Mk3
  'R-Wpn-Rocket01-LtAT',         // Lancer AT Rocket
  'R-Struc-Research-Upgrade04',  // Dedicated Synaptic Link Data Analysis
  'R-Wpn-Rocket-Damage04',       // HEAT Rocket Warhead
  'R-Struc-Power-Upgrade01',     // Gas Turbine Generator
  'R-Struc-Research-Upgrade05',  // Dedicated Synaptic Link Data Analysis Mk2
  'R-Wpn-Rocket-Damage05',       // HEAT Rocket Warhead Mk2
  'R-Sys-Engineering02',         // Improved Engineering
  'R-Struc-Power-Upgrade01b',    // Gas Turbine Generator Mk2
  'R-Struc-Research-Upgrade06',  // Dedicated Synaptic Link Data Analysis Mk3
  'R-Defense-WallUpgrade04',     // Supercrete
  'R-Struc-Power-Upgrade01c',    // Gas Turbine Generator Mk3
  'R-Struc-Research-Upgrade07',  // Neural Synapse Research Brain
  'R-Struc-Power-Upgrade02',     // Vapor Turbine Generator
  'R-Wpn-Rocket-Accuracy02',     // Improved Rocket Wire Guidance
  'R-Struc-Research-Upgrade08',  // Neural Synapse Research Brain Mk2
  'R-Struc-Power-Upgrade03',     // Vapor Turbine Generator Mk2
  'R-Defense-WallUpgrade05',     // Supercrete Mk2
  'R-Struc-Research-Upgrade09',  // Neural Synapse Research Brain Mk3
  'R-Struc-Power-Upgrade03a',    // Vapor Turbine Generator Mk3
  'R-Wpn-RocketSlow-Accuracy01', // Rocket Laser Designator
  'R-Wpn-Rocket-Damage06',       // HEAT Rocket Warhead Mk3
  'R-Sys-Autorepair-General',    // Auto-Repair
  'R-Wpn-RocketSlow-Accuracy02', // Thermal Imaging Rockets
  'R-Wpn-Rocket07-Tank-Killer',  // Tank Killer Rocket
  'R-Defense-WallUpgrade06',     // Supercrete Mk3
  'R-Sys-Engineering03',         // Advanced Engineering
  'R-Wpn-Missile2A-T',           // Scourge Missile
  'R-Defense-WallUpgrade07',     // Plascrete
  'R-Wpn-Missile-ROF01',         // Advanced Missile Allocation System
  'R-Defense-WallUpgrade08',     // Plascrete Mk2
  'R-Wpn-Missile-ROF02',         // Advanced Missile Allocation System Mk2
  'R-Defense-WallUpgrade09',     // Plascrete Mk3
  'R-Wpn-Missile-ROF03',         // Advanced Missile Allocation System Mk3
  'R-Defense-WallUpgrade10',     // Plasteel
  'R-Defense-Super-Missile',     // Missile Fortress
  'R-Wpn-Missile-Damage01',      // Advanced Missile Warhead
  'R-Sys-Sensor-Upgrade01',      // Sensor Upgrade
  'R-Struc-Materials01',         // Reinforced Base Structure Materials
  'R-Struc-Factory-Cyborg',      // Cyborg Factory
  'R-Sys-Sensor-Upgrade02',      // Sensor Upgrade Mk2
  'R-Struc-Materials02',         // Reinforced Base Structure Materials Mk2
  'R-Struc-Factory-Module',      // Factory Module
  'R-Vehicle-Metals01',          // Composite Alloys Mk1
  'R-Struc-Materials03',         // Reinforced Base Structure Materials Mk3
  'R-Sys-Sensor-Upgrade03',      // Sensor Upgrade Mk3
  'R-Wpn-Missile-Accuracy01',    // Target Prediction Missiles
  'R-Struc-Factory-Upgrade01',   // Automated Manufacturing
  'R-Vehicle-Metals01',          // Composite Alloys
  'R-Defense-WallUpgrade11',     // Plasteel Mk2
  'R-Wpn-Missile-Damage01',      // Advanced Missile Warhead Mk2
  'R-Vehicle-Metals02',          // Composite Alloys Mk2
  'R-Struc-Materials04',         // Hardened Base Structure Materials
  'R-Struc-Materials05',         // Hardened Base Structure Materials Mk2
  'R-Vehicle-Metals03',          // Composite Alloys Mk3
  'R-Struc-Materials06',         // Hardened Base Structure Materials Mk3
  'R-Wpn-Missile-Accuracy02',    // Search & Destroy Missiles
  'R-Defense-WallUpgrade12',     // Plasteel Mk3
  'R-Struc-Materials07',         // Advanced Base Structure Materials
  'R-Struc-Materials08',         // Advanced Base Structure Materials Mk2
  'R-Wpn-Missile-Damage03',      // Advanced Missile Warhead Mk3
  'R-Struc-Materials09',         // Advanced Base Structure Materials Mk3
  'R-Vehicle-Armor-Heat01',      // Thermal Armor
  'R-Struc-Factory-Upgrade04',   // Robotic Manufacturing
  'R-Vehicle-Metals04',          // Dense Composite Alloys
  'R-Vehicle-Armor-Heat02',      // Thermal Armor Mk2
  'R-Struc-Factory-Upgrade07',   // Advanced Manufacturing
  'R-Vehicle-Metals05',          // Dense Composite Alloys Mk2
  'R-Vehicle-Armor-Heat03',      // Thermal Armor Mk3
  'R-Struc-Factory-Upgrade09',   // Self-Replicating Manufacturing
  'R-Vehicle-Metals09',          // Superdense Composite Alloys Mk3
  'R-Vehicle-Armor-Heat09',      // Vehicle Superdense Thermal Armor Mk3
  'R-Sys-Resistance-Circuits',   // Nexus Resistance Circuits
];
