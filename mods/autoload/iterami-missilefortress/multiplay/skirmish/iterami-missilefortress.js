include('iterami.js');

function eventResearched(research, structure, player){
    if(me !== player){
        return;
    }

    var bodyResearch = {
      'R-Vehicle-Body02': 'Body2SUP',
      'R-Vehicle-Body03': 'Body3MBT',
      'R-Vehicle-Body04': 'Body4ABT',
      'R-Vehicle-Body05': 'Body5REC',
      'R-Vehicle-Body06': 'Body6SUPP',
      'R-Vehicle-Body07': 'Body7ABT',
      'R-Vehicle-Body08': 'Body8MBT',
      'R-Vehicle-Body09': 'Body9REC',
      'R-Vehicle-Body10': 'Body10MBT',
      'R-Vehicle-Body11': 'Body11ABT',
      'R-Vehicle-Body12': 'Body12SUP',
      'R-Vehicle-Body13': 'Body13SUP',
      'R-Vehicle-Body14': 'Body14SUP',
    };
    var propulsionResearch = {
      'R-Vehicle-Prop-Halftracks': 'HalfTrack',
      'R-Vehicle-Prop-Hover': 'hover01',
      'R-Vehicle-Prop-Tracks': 'tracked01',
    };

    if(bodyResearch[research.name]){
        bodies.push(bodyResearch[research.name]);

    }else if(propulsionResearch[research.name]){
        propulsion.push(propulsionResearch[research.name]);
    }
}

function init(){
    perSecond();
    setTimer(
      'perSecond',
      1000
    );

    maxFactories = Math.min(
      maxFactories,
      2
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
            var research = enumResearch();

            if(research.length === 0){
                maxConstructionDroids = 6;
                maxResearchFacilities = 1;
                return;
            }

            startResearch(
              researchFacility,
              research[Math.floor(Math.random() * research.length)].name
            );

        }else{
            startResearch(
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
    var structures = enumStruct(me);

    droids.some(function check_droid(droid){
        var isProjectManager = droid === droids[droidCount - 1];

        if(!isProjectManager){
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

            var droidBody = bodies[Math.floor(Math.random() * bodies.length)];
            var droidPropulsion = propulsion[Math.floor(Math.random() * propulsion.length)];
            var droidWeapon1 = droidBody === 'Body14SUP'
              ? 'SensorTurret1Mk1'
              : undefined;

            buildDroid(
              factory,
              'drone-' + droidBody + '-' + droidPropulsion + '-Spade1Mk1'
                + (droidWeapon1 !== undefined ? '+' + droidWeapon1 : ''),
              droidBody,
              droidPropulsion,
              '',
              DROID_CONSTRUCT,
              'Spade1Mk1',
              droidWeapon1
            );
        });
    }

    setMiniMap(true);
}

function startResearch(researchFacility, research){
    if(!researchRandom){
        var targetResearch = getResearch('R-Defense-Super-Missile');

        if(targetResearch.done
          || targetResearch.started){
            researchRandom = true;
        }
    }

    pursueResearch(
      researchFacility,
      research
    );
}

var bodies = ['Body1REC'];
var maxConstructionDroids = 3;
var propulsion = ['wheeled01'];
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