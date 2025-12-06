import nextConfig from "eslint-config-next";

const [baseConfig, ...otherConfigs] = nextConfig;

export default [
  {
    ...baseConfig,
    rules: {
      ...baseConfig.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  ...otherConfigs,
];