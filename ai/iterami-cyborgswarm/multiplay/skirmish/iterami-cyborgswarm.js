function attack(enemy){
    var cyborgs = enumDroid(me);

    for(var cyborg in cyborgs){
        if(cyborgs[cyborg].droidType === DROID_CONSTRUCT){
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
            attack(enemies[enemies.length - 1]);
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

    if(research.name === researchOrder[researchOrder.length - 1]){
        maxConstructionDroids = 5;
        maxResearchFacilities = 1;
        researchDone = true;

    }else if(research.name === 'R-Sys-Autorepair-General'){
        productionBegin = true;

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
}

var cyborgWeapons = [];
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
  'R-Wpn-Flamer01Mk1',          // Flamer
  'R-Wpn-Cannon1Mk1',           // Light Cannon
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
  'R-Wpn-MG-Damage05',          // Tungsten-Tipped MG Bullets
  'R-Struc-Factory-Upgrade01',  // Automated Manufacturing
  'R-Wpn-Cannon-Damage01',      // HEAT Cannon Shells
  'R-Wpn-Flamer-Damage01',      // High Temperature Flamer Gel
  'R-Cyborg-Metals01',          // Cyborg Composite Alloys
  'R-Wpn-Cannon-Damage02',      // HEAT Cannon Shells Mk2
  'R-Wpn-Flamer-Damage02',      // High Temperature Flamer Gel Mk2
  'R-Struc-Factory-Upgrade04',  // Robotic Manufacturing
  'R-Wpn-Mortar01Lt',           // Mortar
  'R-Wpn-Rocket05-MiniPod',     // Mini-Rocket Pod
  'R-Wpn-MG-Damage06',          // Tungsten-Tipped MG Bullets Mk2
  'R-Cyborg-Metals02',          // Cyborg Composite Alloys Mk2
  'R-Wpn-Cannon-Damage03',      // HEAT Cannon Shells Mk3
  'R-Wpn-Rocket-Damage01',      // HE Rockets
  'R-Wpn-Flamer-Damage03',      // High Temperature Flamer Gel Mk3
  'R-Struc-Factory-Upgrade07',  // Advanced Manufacturing
  'R-Wpn-Cannon-Accuracy01',    // Cannon Laser Rangefinder
  'R-Wpn-Mortar-Damage01',      // HE Mortar Shells
  'R-Wpn-MG-Damage07',          // Tungsten-Tipped MG Bullets Mk3
  'R-Wpn-Rocket-Damage02',      // HE Rockets Mk2
  'R-Cyborg-Metals03',          // Cyborg Composite Alloys Mk3
  'R-Wpn-Flamer-ROF01',         // Flamer Autoloader
  'R-Wpn-Cannon-Damage04',      // APFSDS Cannon Rounds
  'R-Wpn-Flamer-Damage04',      // Superhot Flamer Gel
  'R-Wpn-Mortar-Damage02',      // HE Mortar Shells Mk2
  'R-Wpn-Rocket-Damage03',      // HE Rockets Mk3
  'R-Wpn-MG-ROF01',             // Chaingun Upgrade
  'R-Wpn-MG-Damage08',          // Depleted Uranium MG Bullets
  'R-Vehicle-Engine02',         // Fuel Injection Engine Mk2
  'R-Wpn-Flamer-ROF02',         // Flamer Autoloader Mk2
  'R-Wpn-Rocket01-LtAT',        // Lancer AT Rocket
  'R-Wpn-Mortar-Damage03',      // HE Mortar Shells Mk3
  'R-Wpn-Flamer-Damage05',      // Superhot Flamer Gel Mk2
  'R-Wpn-Cannon-Damage05',      // APFSDS Cannon Rounds Mk2
  'R-Cyborg-Metals04',          // Cyborg Dense Composite Alloys
  'R-Wpn-Rocket-Damage04',      // HEAT Rocket Warhead
  'R-Cyborg-Armor-Heat01',      // Cyborg Thermal Armor
  'R-Wpn-Mortar-ROF01',         // Mortar Autoloader
  'R-Wpn-Cannon-Accuracy02',    // Cannon Laser Designator
  'R-Vehicle-Engine03',         // Fuel Injection Engine Mk3
  'R-Wpn-Flamer-ROF03',         // Flamer Autoloader Mk3
  'R-Wpn-Mortar-Damage04',      // HEAP Mortar Shells
  'R-Wpn-Rocket-Damage05',      // HEAT Rocket Warhead Mk2
  'R-Wpn-Rocket-ROF01',         // Rocket Autoloader
  'R-Wpn-Cannon-Damage06',      // APFSDS Cannon Rounds Mk3
  'R-Wpn-Flamer-Damage06',      // Superhot Flamer Gel Mk3
  'R-Wpn-Mortar-Acc01',         // Mortar Targeting Computer
  'R-Wpn-MG-ROF02',             // Rapid Fire Chaingun
  'R-Wpn-Mortar-ROF02',         // Mortar Autoloader Mk2
  'R-Wpn-Rocket-ROF02',         // Rocket Autoloader Mk2
  'R-Wpn-Rocket-Accuracy01',    // Stabilized Rockets
  'R-Cyborg-Metals05',          // Cyborg Dense Composite Alloys Mk2
  'R-Cyborg-Armor-Heat02',      // Cyborg Thermal Armor Mk2
  'R-Wpn-Rocket-Damage06',      // HEAT Rocket Warhead Mk3
  'R-Wpn-Mortar-Damage05',      // HEAP Mortar Shells Mk2
  'R-Wpn-Cannon-Damage07',      // HVAPFSDS Cannon Rounds
  'R-Wpn-Mortar-Acc02',         // Thermal Imaging Mortar Shells
  'R-Wpn-Rocket-ROF03',         // Rocket Autoloader Mk3
  'R-Wpn-Rocket-Accuracy02',    // Improved Rocket Wire Guidance
  'R-Wpn-Cannon-ROF01',         // Cannon Autoloader
  'R-Struc-Factory-Upgrade09',  // Self-Replicating Manufacturing
  'R-Cyborg-Metals06',          // Cyborg Dense Composite Alloys Mk3
  'R-Wpn-Mortar-ROF03',         // Mortar Autoloader Mk3
  'R-Wpn-Rocket-Damage07',      // HESH Rocket Warhead
  'R-Cyborg-Armor-Heat03',      // Cyborg Thermal Armor Mk3
  'R-Wpn-Mortar-Damage06',      // HEAP Mortar Shells Mk3
  'R-Wpn-Cannon-Damage08',      // HVAPFSDS Cannon Rounds Mk2
  'R-Wpn-Cannon-ROF02',         // Cannon Autoloader Mk 2
  'R-Wpn-Mortar-Acc03',         // Target Acquisition Mortar Shells
  'R-Wpn-MG-ROF03',             // Hyper Fire Chaingun Upgrade
  'R-Cyborg-Metals07',          // Cyborg Superdense Composite Alloys
  'R-Wpn-Rocket-Damage08',      // HESH Rocket Warhead Mk2
  'R-Cyborg-Armor-Heat04',      // Cyborg High Intensity Thermal Armor
  'R-Wpn-MG4',                  // Assault Gun
  'R-Wpn-Cannon-Damage09',      // HVAPFSDS Cannon Rounds Mk3
  'R-Wpn-Cannon-ROF03',         // Cannon Autoloader Mk3
  'R-Cyborg-Metals08',          // Cyborg Superdense Composite Alloys Mk2
  'R-Cyborg-Armor-Heat05',      // Cyborg High Intensity Thermal Armor Mk2
  'R-Wpn-Mortar-ROF04',         // Mortar Fast Loader
  'R-Wpn-Rocket-Damage09',      // HESH Rocket Warhead Mk3
  'R-Wpn-Cannon-ROF04',         // Cannon Rapid Loader
  'R-Wpn-RailGun01',            // Needle Gun
  'R-Cyborg-Metals09',          // Cyborg Superdense Composite Alloys Mk3
  'R-Cyborg-Armor-Heat05',      // Cyborg High Intensity Thermal Armor Mk3
  'R-Wpn-Cannon-ROF05',         // Cannon Rapid Loader Mk2
  'R-Cyborg-Armor-Heat08',      // Cyborg Superdense Thermal Armor Mk2
  'R-Wpn-Laser01',              // Laser - Flashlight
  'R-Wpn-Missile2A-T',          // Scourge Missile
  'R-Wpn-Cannon-ROF06',         // Cannon Rapid Loader Mk3
  'R-Cyborg-Armor-Heat09',      // Cyborg Superdense Thermal Armor Mk3
  'R-Sys-Resistance-Circuits',  // Nexus Resistance Circuits
];
