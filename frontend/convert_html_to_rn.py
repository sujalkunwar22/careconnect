import re
from bs4 import BeautifulSoup

def is_text_class(c):
    text_prefixes = [
        'text-', 'font-', 'leading-', 'tracking-', 'whitespace-', 
        'break-', 'truncate', 'capitalize', 'lowercase', 'uppercase',
        'italic', 'not-italic', 'antialiased', 'subpixel-antialiased'
    ]
    if c == 'text-center' or c == 'text-left' or c == 'text-right' or c == 'text-justify':
        return True
    return any(c.startswith(p) for p in text_prefixes)

def convert_to_rn(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find main
    main_node = soup.find('main')
    header_node = soup.find('header')
    
    def process_node(node):
        if isinstance(node, str):
            text = node.strip()
            if not text: return ""
            return text
            
        tag_name = node.name
        if not tag_name: return ""
        
        # Skip svgs and replace with Svg component
        if tag_name == 'svg':
            return '<Svg viewBox="0 0 200 200" className="absolute top-0 right-0 w-64 h-64 -mt-16 -mr-16 opacity-5 pointer-events-none"><Path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,96.5,-2.9C96.2,12.3,89.5,27.3,79.5,39.8C69.5,52.3,56.2,62.3,41.5,69.5C26.8,76.7,10.7,81.1,-4.8,83.9C-20.3,86.7,-35.1,87.9,-48.3,82.4C-61.5,76.9,-73.1,64.7,-81.4,50.6C-89.7,36.5,-94.7,20.5,-93.4,5.1C-92.1,-10.3,-84.5,-25.1,-75.1,-38.2C-65.7,-51.3,-54.5,-62.7,-41.4,-70.3C-28.3,-77.9,-13.3,-81.7,1.4,-84C16.1,-86.3,30.6,-83.6,44.7,-76.4Z" fill="#1D3557" transform="translate(100 100)"/></Svg>'
            
        classes = node.get('class', [])
        rn_tag = "View"
        
        if tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'a']:
            rn_tag = "Text"
        elif tag_name == 'button':
            rn_tag = "TouchableOpacity"
        elif tag_name == 'img':
            rn_tag = "Image"
            
        # special handling for icons
        is_icon = False
        if 'material-symbols-outlined' in classes:
            rn_tag = "Text"
            is_icon = True
            
        view_classes = []
        text_classes = []
        for c in classes:
            if is_text_class(c):
                text_classes.append(c)
            else:
                view_classes.append(c)
                
        children_str = ""
        for child in node.children:
            children_str += process_node(child)
            
        if rn_tag == "Image":
            src = node.get('src', '')
            return f'<Image source={{{{uri: "{src}"}}}} className="{" ".join(classes)}" />'
            
        if rn_tag == "Text":
            # For Text elements, all classes go on the Text
            class_attr = ' className="' + ' '.join(classes) + '"' if classes else ""
            # Don't nest Text in Text if the child is just plain text, but BeautifulSoup already handles string children
            return f'<{rn_tag}{class_attr}>{children_str}</{rn_tag}>'
            
        # For View or TouchableOpacity containing text directly, wrap the text in <Text> with text_classes
        new_children = ""
        for child in node.children:
            if isinstance(child, str) and child.strip():
                if text_classes:
                    new_children += f'<Text className="{" ".join(text_classes)}">{child.strip()}</Text>'
                else:
                    new_children += f'<Text>{child.strip()}</Text>'
            else:
                # If it's an element, process it
                if child.name:
                    # Pass the parent\'s text_classes down if the child is a text node? NativeWind handles text inheritance partially, but explicitly setting is better.
                    # Actually, if we just process node, we might lose parent text colors for nested Views.
                    new_children += process_node(child)
                    
        class_attr = ' className="' + ' '.join(view_classes) + '"' if view_classes else ""
        return f'<{rn_tag}{class_attr}>{new_children}</{rn_tag}>'

    header_rn = process_node(header_node) if header_node else ""
    main_rn = process_node(main_node) if main_node else ""
    
    return header_rn + main_rn

if __name__ == "__main__":
    with open('../public/UserDashboard.html', 'r', encoding='utf-8') as f:
        html = f.read()
        
    rn_code = convert_to_rn(html)
    
    # Wrap in component
    full_code = """import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ProfessionalDashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        %s
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfessionalDashboardScreen;
""" % rn_code

    # Some manual fixes: e.g. `<div class="flex overflow-x-auto ...` -> ScrollView horizontal
    full_code = full_code.replace('<View className="flex overflow-x-auto gap-6 pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">', '<ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex flex-row overflow-visible gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0">')
    full_code = full_code.replace('</View>\n<!-- Recent Applications List -->', '</ScrollView>') # Quick fix for the end of that container
    # Actually regex replace the end of that specific View:
    full_code = re.sub(r'(<ScrollView horizontal.*?>.*?)</View>', r'\\1</ScrollView>', full_code, flags=re.DOTALL)
    
    with open('src/screens/main/ProfessionalDashboardScreen.js', 'w', encoding='utf-8') as f:
        f.write(full_code)
    print("Done")
