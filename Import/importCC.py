# http://www.imsglobal.org/cc/index.html

opening = '''<?xml version="1.0" encoding="utf-8"?>
<manifest identifier="CCCS610" xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1" xmlns:lomr="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource" xmlns:lomm="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p3/LOM/ccv1p3_lomresource_v1p0.xsd http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imscp_v1p2_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest http://www.imsglobal.org/profile/cc/ccv1p3/LOM/ccv1p3_lommanifest_v1p0.xsd">
<metadata>
<schema>IMS Common Cartridge</schema>
<schemaversion>1.3.0</schemaversion>
<lomm:lom>
<lomm:general>
<lomm:title>'''

intermediate = '''</lomm:title>
</lomm:general>
</lomm:lom>
</metadata>
<organizations>
<organization identifier="SCSTI" structure="rooted-hierarchy">'''

secondinter = '''</item>
<metadata>
<lomm:lom />
</metadata>
</organization>
</organizations>
<resources>'''

titles = { 'CCCS610': 'Digital Thinking for Data Analysis',
           'CCCS620': 'Data Analysis and Modeling' }

items = [ 'Recap', 'Introduction', 'Interaction', 'Assessment', 'Preview' ]

import os

for course in titles:
    if not os.path.exists(course):
        os.mkdir(course)
    title = titles[course].replace(' ', '_')
    with open(course + '/imsmanifest.xml', 'w') as target:
        print(opening, file = target)
        print(f'<lomm:string language="en-US">{course}_{title}</lomm:string>', file = target)
        print(intermediate, file = target)
        print(f'<item identifier="{course}">', file = target)
        for m in range(1, 13):
            module = f'{m:02}'
            print(f'<item identifier="{course}M{module}">', file = target)
            print(f'<title>Module {module}</title>', file = target)
            for item in items:
                iid = f'{course}M{module}{item}'
                ref = f'{course}M{module}{item}_R'
                print(f'<item identifier="{iid}" identifierref="{ref}"><title>{item}</title></item>', file = target)
            print('</item>', file = target)
        print(secondinter, file = target)
        print(f'<resource identifier="glossary_R" type="webcontent"><file href="Glossary.html" /></resource>', file = target)
        for m in range(1, 13):
            module = f'{m:02}'
            for item in items:
                ref = f'{course}M{module}{item}_R'            
                print(f'<resource identifier="{ref}" type="webcontent"><file href="M{module}/{item}.html" /></resource>', file = target)
        print('</resources></manifest>', file = target);
