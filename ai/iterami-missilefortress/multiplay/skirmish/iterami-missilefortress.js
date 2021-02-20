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

function eventGameLoaded(){
    init();
}

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    if(research.name === researchOrder[researchOrder.length - 1]){
        researchRandom = true;
    }
}

function eventStartLevel(){
    init();
}

function init(){
    perSecond();
    setTimer(
      'perSecond',
      1000
    );

    maxResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );
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
            pursueResearch(
              researchFacility,
              researchOrder
            );
        }
    });

    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );
    var droidCount = droids.length;
    var lessThan2 = droidCount < 2;
    var structures = enumStruct(me);

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
            'A0CommandCentre',
            1
          )){
            buildStructure(
              droid,
              'A0CommandCentre'
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

            }else if(isStructureAvailable(
                'X-Super-Missile',
                me
              )){
                buildStructure(
                  droid,
                  'X-Super-Missile'
                );
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

    setMiniMap(true);
}

function randomLocation(droid){
    orderDroidLoc(
      droid,
      DORDER_MOVE,
      Math.floor(Math.random() * mapWidth),
      Math.floor(Math.random() * mapHeight)
    );
}

function randomResearch(researchFacility){
    var research = enumResearch();

    if(research.length === 0){
        maxConstructionDroids = 6;
        maxResearchFacilities = 1;
        return;
    }

    pursueResearch(
      researchFacility,
      research[Math.floor(Math.random() * research.length)].name
    );
}

var maxConstructionDroids = 3;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
var researchRandom = false;

var researchOrder = [
  'R-Sys-Engineering01',
  'R-Vehicle-Engine01',
  'R-Sys-Sensor-Turret01',
  'R-Defense-HardcreteWall',
  'R-Defense-WallUpgrade01',
  'R-Sys-Sensor-Tower01',
  'R-Struc-PowerModuleMk1',
  'R-Wpn-Rocket05-MiniPod',
  'R-Struc-CommandRelay',
  'R-Defense-WallUpgrade02',
  'R-Wpn-Rocket-Damage01',
  'R-Struc-Research-Module',
  'R-Wpn-Rocket-Damage02',
  'R-Struc-Research-Upgrade01',
  'R-Defense-WallUpgrade03',
  'R-Struc-Research-Upgrade02',
  'R-Wpn-Rocket-Damage03',
  'R-Wpn-Rocket-Accuracy01',
  'R-Struc-Research-Upgrade03',
  'R-Wpn-Rocket01-LtAT',
  'R-Struc-Research-Upgrade04',
  'R-Wpn-Rocket-Damage04',
  'R-Struc-Power-Upgrade01',
  'R-Struc-Research-Upgrade05',
  'R-Wpn-Rocket-Damage05',
  'R-Sys-Engineering02',
  'R-Struc-Power-Upgrade01b',
  'R-Struc-Research-Upgrade06',
  'R-Defense-WallUpgrade04',
  'R-Struc-Power-Upgrade01c',
  'R-Struc-Research-Upgrade07',
  'R-Struc-Power-Upgrade02',
  'R-Wpn-Rocket-Accuracy02',
  'R-Struc-Research-Upgrade08',
  'R-Struc-Power-Upgrade03',
  'R-Defense-WallUpgrade05',
  'R-Struc-Research-Upgrade09',
  'R-Struc-Power-Upgrade03a',
  'R-Wpn-RocketSlow-Accuracy01',
  'R-Wpn-Rocket-Damage06',
  'R-Sys-Autorepair-General',
  'R-Wpn-RocketSlow-Accuracy02',
  'R-Wpn-Rocket07-Tank-Killer',
  'R-Defense-WallUpgrade06',
  'R-Sys-Engineering03',
  'R-Wpn-Missile2A-T',
  'R-Defense-WallUpgrade07',
  'R-Wpn-Missile-ROF01',
  'R-Defense-WallUpgrade08',
  'R-Wpn-Missile-ROF02',
  'R-Defense-WallUpgrade09',
  'R-Wpn-Missile-ROF03',
  'R-Defense-WallUpgrade10',
  'R-Defense-Super-Missile',
];
