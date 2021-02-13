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

        // Build Missile Fortresses.
        }else if(isStructureAvailable(
            'X-Super-Missile',
            me
          )){
            buildStructure(
              droid,
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

    }else{
        randomLocation(droid);
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

function eventGameLoaded(){
    init();
}

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    // Modify strategy when research order is done.
    if(research.name === researchOrder[researchOrder.length - 1]){
        researchRandom = true;
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

function randomLocation(droid){
    const randomX = Math.floor(Math.random() * mapWidth);
    const randomY = Math.floor(Math.random() * mapHeight);

    if(!droidCanReach(
        droid,
        randomX,
        randomY
      )){
        continue;
    }

    orderDroidLoc(
      droid,
      DORDER_MOVE,
      randomX,
      randomY
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

var maxConstructionDroids = 2;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var queueTimer = 1000;
var researchDone = false;
var researchRandom = false;

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
];
