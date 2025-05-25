import { Link } from 'expo-router';
import React from 'react';
import { Linking, Text } from 'react-native';
import Markdown, { MarkdownProps } from 'react-native-markdown-display';

const WEBSITE_DOMAIN = 'prospectorminerals.com';

function isInternalLink(url: string) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.endsWith(WEBSITE_DOMAIN);
    } catch {
        return false;
    }
}

type CustomMarkdownProps = MarkdownProps & {
    children: string;
};

const CustomMarkdown: React.FC<CustomMarkdownProps> = (props) => {
    return (
        <Markdown
            {...props}
            rules={{
                ...props.rules,
                link: (node, children, parent, styles) => {
                    const url = node.attributes.href || '';
                    if (isInternalLink(url)) {
                        // Use Expo Router Link for internal links
                        // Remove domain for path
                        let path = url;
                        try {
                            const parsed = new URL(url);
                            path = parsed.pathname + (parsed.search || '') + (parsed.hash || '');
                        } catch {}
                        return (
                            <Link href={path} key={node.key} style={styles.link}>
                                {children}
                            </Link>
                        );
                    } else {
                        // External: open in browser
                        return (
                            <Text
                                key={node.key}
                                style={styles.link}
                                onPress={() => Linking.openURL(url)}
                            >
                                {children}
                            </Text>
                        );
                    }
                }
            }}
        />
    );
};

export default CustomMarkdown;
