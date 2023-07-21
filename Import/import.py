# http://www.imsglobal.org/cc/index.html

notebook = {
    3: 'antennas',
    6: 'canopy',
    4: 'coloring',
    10: 'epidemic',
    12: 'flow',
    5: 'roads',
    9: 'sync',
    2: 'territory',
    7: 'words',
    1: 'snowflake',
    13: 'inventory',
    11: 'resist',
    8: 'compromise' } 

embed = {
    'glossary': '''<!DOCTYPE html>
    <html>
    <body>
    <iframe src="https://scs-technology-and-innovation.github.io/Glossary/TI.html" 
        allowfullscreen="allowfullscreen" 
        width="800" 
        height="1200" 
        frameborder="0">
</iframe>
</body>
</html>''',
    'CCCS620': '''<!DOCTYPE html>
<html>
<body>
<iframe src="https://scs-technology-and-innovation.github.io/courses/#COURSE#/Module#MODULE#/#PART#.html" 
        allowfullscreen="allowfullscreen" 
        width="1200" 
        height="1200" 
        frameborder="0">
</iframe>
</body>
</html>''',
    'CCCS610': '''<!DOCTYPE html>
<html>
<p>
<a href="https://github.com/SCS-Technology-and-Innovation/DACS/blob/main/DTDA/epidemic.ipynb">Download 
the Jupyter Notebook file to interact on your local computer</a> 
(requires 
<a href="https://jupyter.org/install">installing 
the necessary software</a>).
</p>
<iframe src="https://nbviewer.org/github/SCS-Technology-and-Innovation/DACS/blob/main/DTDA/#NOTEBOOK#.ipynb" 
allowfullscreen="allowfullscreen" width="800" height="1200" frameborder="0">
</iframe>
</body>
</html>''' }

opening = '''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="D2L_631816" xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0" xmlns:scorm_1p2="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
    <metadata>
        <imsmd:lom>
            <imsmd:general>'''
intermediate = '''<imsmd:language>en-ca</imsmd:language>
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

titles = { 'CCCS610': 'Digital Thinking for Data Analysis',
           'CCCS620': 'Data Analysis and Modeling' }

items = [ 'Recap', 'Introduction', 'Interaction', 'Assessment', 'Preview' ]
files = [ 'recap', 'intro', 'interact', 'assess', 'next' ]

pairs = dict(zip(items, files))

import os

for course in titles:
    title = titles[course]
    number = course[:-3]
    with open('imsmanifest.xml', 'w') as target:
        print(opening, file = target)
        print(f'''
                <imsmd:title>
                    <imsmd:langstring xml:lang="en-ca">{course}</imsmd:langstring>
                </imsmd:title>
                <imsmd:keyword>
                    <imsmd:langstring xml:lang="en-ca">{course}</imsmd:langstring>
                </imsmd:keyword>''', file = target)
        print(intermediate, file = target)
        for m in range(1, 14):
            module = f'{m:02}'
            gid = number + '00' # glossary
            print(f'<item identifier="{module}" identifierref="{module}R" d2l_2p0:id="m{module}" description="" completion_type="2">', file = target)
            print(f'<title>Module {m}</title>', file = target)
            i = 0
            for item in pairs:
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
        print(f'<resource identifier="{gid}" type="webcontent" d2l_2p0:material_type="content" d2l_2p0:link_target="" href="glossary.html" title="" />', file = target)        
        for m in range(1, 14):
            module = f'{m:02}'
            i = 0
            for item in pairs:
                ref = number + module + f'{i}' + 'R'
                htmlfilename = f'{course}-M{module}-{item}.html'
                print(f'<resource identifier="{ref}" type="webcontent" d2l_2p0:material_type="content" d2l_2p0:link_target="" href="{htmlfilename}" title="" />', \
                      file = target)
                with open(htmlfilename, 'w') as html:
                    content = embed[course]
                    if '#NOTEBOOK#' in content:
                        content = content.replace('#NOTEBOOK#', notebook[m]);
                    else: # COURSE MODULE PART
                        content = content.replace('#COURSE#', course);
                        content = content.replace('#MODULE#', module);
                        content = content.replace('#PART#', pairs[item]);
                    print(content, file = html)
                i += 1
        print(closing, file = target);
