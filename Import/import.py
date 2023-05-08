# http://www.imsglobal.org/cc/index.html

opening = '''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="D2L_631816" xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0" xmlns:scorm_1p2="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
    <metadata>
        <imsmd:lom>
            <imsmd:general>'''
intermediate = '''
                <imsmd:language>en-ca</imsmd:language>
            </imsmd:general>
        </imsmd:lom>
    </metadata>
    <organizations default="d2l_orgs">
        <organization identifier="d2l_org">'''


secondinter = '''
        </organization>
    </organizations>
    <resources>'''

closing = '''
    </resources>
</manifest>'''


titles = { 'CCCS 610': 'Digital Thinking for Data Analysis',
           'CCCS 620': 'Data Analysis and Modeling' }

items = [ 'Recap', 'Introduction', 'Interaction', 'Assessment', 'Preview' ]

import os

for course in titles:
    cc = course.replace(' ', '')
    if not os.path.exists(cc):
        os.mkdir(cc)
    title = titles[course]
    number = cc[:-3]
    tag = cc + title.replace(' ', '_')
    with open(cc + '/imsmanifest.xml', 'w') as target:
        print(opening, file = target)
        print(f'''
                <imsmd:title>
                    <imsmd:langstring xml:lang="en-ca">{tag}</imsmd:langstring>
                </imsmd:title>
                <imsmd:keyword>
                    <imsmd:langstring xml:lang="en-ca">{tag}</imsmd:langstring>
                </imsmd:keyword>''', file = target)
        print(intermediate, file = target)
        for m in range(1, 13):
            module = f'{m:02}'
            gid = number + '00' # glossary
            print(f'<item identifier="{module}" identifierref="{module}R" d2l_2p0:id="m{module}" description="" completion_type="2">', file = target)
            print(f'<title>Module {m}</title>', file = target)
            i = 0
            for item in items:
                iid = number + module + f'{i}'
                ref = iid + 'R'
                print(f'''
                <item identifier="{iid}" identifierref="{ref}" d2l_2p0:id="m{module}_{item}" d2l_2p0:resource_code="McG-4012723" description="" completion_type="2">
                    <title>{item}</title>
                </item>''', file = target)
                i += 1
            print('</item>', file = target)
                
        print(secondinter, file = target)
        print(f'<resource identifier="{number}" type="webcontent" d2l_2p0:material_type="contentmodule" d2l_2p0:link_target="" href="" title="" />', file = target)
        print(f'<resource identifier="{gid}" type="webcontent" d2l_2p0:material_type="content" d2l_2p0:link_target="" href="Glossary.html" title="" />', file = target)        
        for m in range(1, 13):
            module = f'{m:02}'
            i = 0
            for item in items:
                ref = number + module + f'{i}' + 'R'            
                print(f'<resource identifier="{ref}" type="webcontent" d2l_2p0:material_type="content" d2l_2p0:link_target="" href="M{module}/{item}.html" title="" />', file = target)
                i += 1
        print(closing, file = target);
