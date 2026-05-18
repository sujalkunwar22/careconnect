import os
import json
import urllib.request
from bs4 import BeautifulSoup
import re

MAPPING = {
    "User Dashboard": "src/screens/main/ProfessionalDashboardScreen.js",
    "User Management": "src/screens/admin/UserManagementScreen.js",
    "Admin Dashboard": "src/screens/admin/AdminDashboardScreen.js",
    "Job Search": "src/screens/jobs/JobListingsScreen.js",
    "Notifications": "src/screens/main/NotificationsScreen.js",
    "Applicant Management": "src/screens/ngo/JobApplicationsScreen.js", # Best guess
    "Post Job - Step 1": "src/screens/ngo/PostJobStep1Screen.js",
    "Job Detail": "src/screens/jobs/JobDetailScreen.js",
    "NGO Dashboard": "src/screens/ngo/NgoDashboardScreen.js",
    "Applicant Detail Review": "src/screens/ngo/ApplicationReviewScreen.js", # Best guess
    "KYC Review Interface": "src/screens/admin/KycReviewScreen.js",
    "Portfolio Preview": "src/screens/portfolio/PortfolioScreen.js"
}

def is_text_class(c):
    text_prefixes = [
        'text-', 'font-', 'leading-', 'tracking-', 'whitespace-', 
        'break-', 'truncate', 'capitalize', 'lowercase', 'uppercase',
        'italic', 'not-italic', 'antialiased', 'subpixel-antialiased'
    ]
    if c in ['text-center', 'text-left', 'text-right', 'text-justify']:
        return True
    return any(c.startswith(p) for p in text_prefixes)

def process_node(node):
    if isinstance(node, str):
        text = node.strip()
        if not text: return ""
        return text
        
    tag_name = node.name
    if not tag_name: return ""
    
    # Skip svgs and replace with Svg component
    if tag_name == 'svg':
        # Simple generic SVG placeholder to prevent React Native crashes from HTML SVG
        return '<View className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center"><Text className="text-slate-500 material-symbols-outlined">image</Text></View>'
        
    classes = node.get('class', [])
    rn_tag = "View"
    
    if tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'a', 'label', 'li']:
        rn_tag = "Text"
    elif tag_name == 'button':
        rn_tag = "TouchableOpacity"
    elif tag_name == 'img':
        rn_tag = "Image"
        
    if 'material-symbols-outlined' in classes:
        rn_tag = "Text"
        
    if 'overflow-x-auto' in classes:
        rn_tag = "ScrollView"
        
    view_classes = []
    text_classes = []
    for c in classes:
        if is_text_class(c):
            text_classes.append(c)
        elif c == 'overflow-x-auto':
            pass # Remove this class as we use horizontal prop
        else:
            view_classes.append(c)
            
    children_str = ""
    for child in node.children:
        if type(child).__name__ == 'Comment':
            continue # Skip HTML comments
        children_str += process_node(child)
        
    if rn_tag == "Image":
        src = node.get('src', '')
        if not src.startswith('http') and not src.startswith('data:'):
            src = 'https://via.placeholder.com/150'
        class_attr = ' className="' + ' '.join(view_classes) + '"' if view_classes else ""
        return f'<Image source={{{{uri: "{src}"}}}}{class_attr} />'
        
    if rn_tag == "Text":
        class_attr = ' className="' + ' '.join(classes) + '"' if classes else ""
        return f'<{rn_tag}{class_attr}>{children_str}</{rn_tag}>'
        
    if rn_tag == "ScrollView":
        class_attr = ' className="' + ' '.join(view_classes) + '"' if view_classes else ""
        return f'<{rn_tag} horizontal showsHorizontalScrollIndicator={{false}}{class_attr}>{children_str}</{rn_tag}>'
        
    new_children = ""
    for child in node.children:
        if isinstance(child, str) and child.strip():
            if text_classes:
                new_children += f'<Text className="{" ".join(text_classes)}">{child.strip()}</Text>'
            else:
                new_children += f'<Text>{child.strip()}</Text>'
        else:
            if child.name:
                new_children += process_node(child)
                
    class_attr = ' className="' + ' '.join(view_classes) + '"' if view_classes else ""
    return f'<{rn_tag}{class_attr}>{new_children}</{rn_tag}>'

def convert_html_to_rn(html_content, component_name):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    main_node = soup.find('main')
    header_node = soup.find('header')
    
    # Exclude mobile bottom nav if it exists, as React Navigation handles it
    nav_node = soup.find('nav')
    if nav_node and 'fixed bottom-0' in nav_node.get('class', []):
        nav_node.decompose()

    header_rn = process_node(header_node) if header_node else ""
    main_rn = process_node(main_node) if main_node else ""
    
    rn_code = header_rn + main_rn
    
    full_code = f"""import React from 'react';
import {{ View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView }} from 'react-native';

const {component_name} = ({{ navigation }}) => {{
  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={{false}}>
        {rn_code}
      </ScrollView>
    </SafeAreaView>
  );
}};

export default {component_name};
"""


    return full_code

if __name__ == "__main__":
    output_txt_path = r'C:\\Users\\sujal\\.gemini\\antigravity\\brain\\52a751be-25d3-4517-a631-1cff68d8f1e7\\.system_generated\\steps\\380\\output.txt'
    
    with open(output_txt_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for screen in data.get('screens', []):
        title = screen.get('title')
        url = screen.get('htmlCode', {}).get('downloadUrl')
        
        if title in MAPPING and url:
            rn_path = MAPPING[title]
            
            # Extract component name from path (e.g. src/screens/main/ProfessionalDashboardScreen.js -> ProfessionalDashboardScreen)
            component_name = os.path.basename(rn_path).replace('.js', '')
            
            print(f"Downloading HTML for {title}...")
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    html_content = response.read().decode('utf-8')
                    
                rn_code = convert_html_to_rn(html_content, component_name)
                
                os.makedirs(os.path.dirname(rn_path), exist_ok=True)
                
                with open(rn_path, 'w', encoding='utf-8') as out_f:
                    out_f.write(rn_code)
                print(f"SUCCESS: converted {title} to {rn_path}")
            except Exception as e:
                print(f"FAILED to process {title}: {e}")
