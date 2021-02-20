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
    return structure !== undefined
      && isStructureAvailable(
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

    var defenseStructureResearch = {
      'R-Defense-Emplacement-HPVcannon': 'Emplacement-HPVcannon',
      'R-Defense-PrisLas': 'Emplacement-PrisLas',
      'R-Defense-PulseLas': 'GuardTower-BeamLas',
      'R-Defense-Super-Missile': 'X-Super-Missile',
      'R-Defense-Tower01': 'GuardTower1',
      'R-Defense-Tower06': 'GuardTower6',
      'R-Defense-Wall-RotMg': 'Wall-RotMg',
      'R-Defense-WallTower-HPVcannon': 'WallTower-HPVcannon',
      'R-Defense-WallTower-PulseLas': 'WallTower-PulseLas',
      'R-Defense-WallTower-TwinAGun': 'WallTower-TwinAssaultGun',
      'R-Defense-WallTower01': 'WallTower01',
    };

    if(defenseStructureResearch[research.name]){
        defenseStructures.push(defenseStructureResearch[research.name]);
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
    setTimer(
      'perMinute',
      60000
    );

    maxResearchFacilities = getStructureLimit(
      'A0ResearchFacility',
      me
    );
}

function perMinute(){
    var droids = enumDroid(
      me,
      DROID_CONSTRUCT
    );

    droids.some(function check_droid(droid){
        if(droid.order === 0){
            orderDroid(
              droid,
              DORDER_RTB
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

        randomResearch(researchFacility);
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

function randomLocation(){
    return {
      'x': Math.floor(Math.random() * mapWidth),
      'y': Math.floor(Math.random() * mapHeight),
    };
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

var defenseStructures = [];
var maxConstructionDroids = 3;
var maxDefenseStructures = 3;
var maxFactories = 2;
var maxResearchFacilities = 5;
var maxResourceExtractors = 4;
