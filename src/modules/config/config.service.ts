import Config from './config.model';

/**
 * Get App Configs
 * @returns {Promise<QueryResult>}
 */
export const getConfigs = async () => {
  const configs = await Config.find({ private: false });
  const formattedConfigs = configs.reduce((acc: { [key: string]: any }, config) => {
    if (config) {
      const formattedConfig = config.toJSON();
      acc[formattedConfig.key] = formattedConfig.value;
    } else {
      acc[(config as any).key] = null;
    }
    return acc;
  }, {});

  return formattedConfigs;
};

/**
 * Update Configs
 * @param {ConfigBody} updateBody
 * @returns {Promise<Object>}
 */
export const updateConfigs = async (updateBody: any) => {
  const body = updateBody;
  const keys = Object.keys(body);

  await Promise.all(
    keys.map(async (key) => {
      const config: any = await Config.findOne({ key });
      if (!config) {
        if (!(await Config.isKeyTaken(key))) {
          await Config.create({ key, value: body[key] });
        }
      } else if (body[key] && !(await Config.isKeyTaken(key, config.id))) {
        Object.assign(config, { value: body[key] });
        await config.save();
      }
    })
  );

  return getConfigs();
};
