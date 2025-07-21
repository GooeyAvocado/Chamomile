import HelpDisplay from "./helpDisplay/HelpDisplay";
import HelpSection from "./helpDisplay/HelpSection";
import GithubLink from "../../githubLink/GithubLink";
import { Alert, AlertTitle, Button, Card, CardContent, IconButton, Link, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import { BarChart, CalendarMonth, Coffee, CoffeeOutlined, DirectionsRun, ExpandMore, Gradient, Height, LibraryAdd, Menu, ModelTraining, Monitor, MoreVert, PhotoLibrary, Star, Terminal, ThumbDown, Tune, Window, Yard } from "@mui/icons-material";
import { usePrompt } from "../../../hooks/usePrompt";
import { ReactNode } from "react";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import AdvSearchHelp from "../../filter/AdvSearchHelp";

export default function HelpTab(props: {
    setOpen: (val: boolean) => void
}) {

    const { setOpen } = props;
    const codeStyle = { background: "#222", padding: "5px", fontFamily: "monospace" };
    const { setPrompt, prompt } = usePrompt();
    const { width } = useWindowDimensions();

    const writePrompt = (val: string) => {
        setOpen(false)
        setPrompt({
            ...prompt,
            positivePrompt: val,
            negativePrompt: "",
            width: 1024,
            height: 1024,
            steps: 30
        })
    }

    const keyCombo = (keys: string[]) => {
        return <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
            {keys.map((a, i) => {
                return <>
                    <span style={{ ...codeStyle, padding: "0px 10px" }}>{a}</span>
                    {i !== keys.length - 1 && <span style={{ padding: "0px 5px" }}>+</span>}
                </>
            })}
        </span>
    }
    const BrewButton = <Button variant="contained" style={{ transform: "scale(.8)" }}>Brew</Button>
    const LabeledIcon = (props: {
        children: ReactNode,
        label: string
    }) => <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: 'middle', gap: "10px" }}>{props.children} {props.label}</span>

    const samplePrompt = "man made of blue slime, slime man, slime, melting, liquid hair, ((furry)), dog, canine, anthro, twink, chubby, blue skin, transparent skin, translucent skin, polo, sweatpants, waving, looking at viewer, smile"

    return <HelpDisplay height={"75vh"} tabsWidth={200}>

        <HelpSection title="Welcome to Chamomile" >
            <p>
                Welcome to Chamomile! We hope that Chamomile helps you easily generate more images from Stable Diffusion,
                as well as manage and browse your collection of images.
            </p>
            <p>Click on a section on the left to learn more about Chamomile's features</p>
            <div style={{ marginTop: '50px' }}>
                <p>Please report any bugs you find to our <GithubLink href="https://github.com/GooeyAvocado/Chamomile">Github!</GithubLink> </p>

            </div>
        </HelpSection>

        <HelpSection title="Setting up Stable Diffusion" >
            <p>
                Chamomile is a wrapper for an A1111 or equivalent Stable Diffusion webui . That means that if you've set up
                the docker container for this app, you're only really halfway there if you're starting from scratch.
                If you don't have one of these already set up on your system, consider downloading one from the list below:
            </p>
            <ul>
                <li>
                    <GithubLink href="https://github.com/Panchovix/stable-diffusion-webui-reForge">
                        Reforge (Recommended)
                    </GithubLink>
                </li>
                <li>
                    <GithubLink href="https://github.com/lllyasviel/stable-diffusion-webui-forge">
                        Forge
                    </GithubLink>
                </li>
                <li>
                    <GithubLink href="https://github.com/AUTOMATIC1111/stable-diffusion-webui">
                        Automatic1111
                    </GithubLink>
                </li>
            </ul>
            <p>
                Once you've installed your Automatic1111, start it up and make sure you're able to generate an image. You can later import
                it to Chamomile anyways.
            </p>
            <p>
                Once you've got a working Stable Diffusion WebUI, you'll need to enable the API. You can do this by adding <span style={codeStyle}>
                    --api
                </span> to your <span style={codeStyle}>
                    COMMANDLINE_ARGS
                </span> on <span style={codeStyle}>
                    webui-user.bat
                </span>. If you have your web ui running, restart it so this argument takes effect.
            </p>
            <p>If you've completed this set up
                successfully, your {BrewButton} button should now be enabled!</p>
        </HelpSection>

        <HelpSection title="Importing Your Existing Collection" >
            <img src="/screenshots/filedrop.png" style={{ width: "100%" }} />
            <p>
                If you've previously generated images with your WebUI, you can import images to Chamomile by dragging and dropping one or
                more files or folders into Chamomile. We'll take care of extracting the metadata already embedded on each image to populate
                Prompt, Model, LoRAs, Scheduler, Seed, and other information.
            </p>
        </HelpSection>

        <HelpSection title="Generating Your First Images" >
            <p>
                If your {BrewButton} button is enabled, you should be able to start generating images.
                Try generating this prompt:
            </p>
            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                <div style={{ ...codeStyle, padding: "20px", flex: '1', display: "flex", gap: "10px", alignItems: 'start' }}>
                    <Tooltip title="Use this prompt">
                        <IconButton onClick={() => writePrompt(samplePrompt)}>
                            <Terminal />
                        </IconButton>
                    </Tooltip>
                    <div>
                        {samplePrompt}
                    </div>
                </div>
                <img src="/images/wave.png" style={{ width: "25%" }} />
            </div>
            <div>
                <i>Hint: Press the terminal icon to load this prompt to your prompt box and close this window</i>
            </div>

            <div style={{ marginTop: "20px" }}>
                By default, Chamomile places 3 images in the queue when you hit {BrewButton}, but you can modify
                this easily. Simply click on the <LabeledIcon label="More Options"> <ExpandMore /></LabeledIcon> button
                on the prompt box and set your <LabeledIcon label="Amount"><Coffee /></LabeledIcon> of images up or down.
            </div>
        </HelpSection>

        <HelpSection title="Using Different Models and LoRAs" >
            <img src="/screenshots/models.png" style={{ width: "70%" }} />
            <p>
                One of the basic ways to generate different images beyond prompting differently is to use different models and low-rank
                adaptations (LoRAs) on top of said models. Chamomile makes it easy to select your model and add or remove LoRAs to your
                prompt. Click on the <LabeledIcon label="Select Models button"><ModelTraining /></LabeledIcon> on the prompt box.
            </p>
            <Alert severity="warning" style={{ fontSize: ".8em" }}>
                <AlertTitle style={{ fontSize: "1.2em" }}>New models and LoRAs may not automatically be visible</AlertTitle>
                While Chamomile refreshes models and availability every time you open the select models dialog, your web
                ui may not. If your newly downloaded models aren't showing up in Chamomile, open your Web UI and refresh
                the list of models there, then open the dialog on Chamomile again. Or, simply restart your Web UI.
            </Alert>
            <p>
                Models can only be set globally, and will affect pending generations. If you change your model while there's still
                prompts pending, they will be generated using the new model. Models are pulled from your WebUI and should be downloaded
                to the following directory: <div style={codeStyle}>/(your webUI root)/models/stable-diffusion</div>
            </p>
            <p>
                LoRAs can be set on an individual prompt level, and will appear on your prompt between greater than and less than signs.
                IE: <span style={codeStyle}>{"<lora:MyLora:1>"}</span>. That "1" at the end is the weight. Different LoRAs have different
                recommended, minimum, and maximum weights which you should check when you download them. LoRAs are also pulled from your
                WebUI and should be downloaded to the following directory: <div style={codeStyle}>/(your webUI root)/models/lora</div>
            </p>
            <p>
                Hint: If your images come out looking like a garbled mess of colors, you may have too many LoRAs, or the weights of one or
                more of your LoRAs may be too high. Try adjusting or removing unnecessary LoRAs and see if that helps.
            </p>
            <p>You can download additional models from several sources, but we recommend <Link href="https://civitai.com/">CivitAI</Link></p>
        </HelpSection>

        <HelpSection title="Model and LoRA Management" >
            <img src="/screenshots/modelEdit.png" width={"50%"} />
            <p>
                As part of adding models to Chamomile, you should also take the time to set your model type a sample image, and some notes.
                Your LoRA can also store activation tags, though these are purely for notes (for now).
            </p>
            <p>
                You can also set a sample image from the image viewer. Simply click the <LabeledIcon label="Menu button"><MoreVert /></LabeledIcon>
                {" "}on the LoRA or Model card, and select <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Set this as sample image</Card>
            </p>
        </HelpSection>

        <HelpSection title="Using Wildcards" >
            <img src="/screenshots/wildcards.png" width={"100%"} />
            <p>
                Chamomile works with Dynamic Prompts and our Wildcard Browser extension. You can install them quickly by
                downloading the github's contents and putting it in folders for them. You can download both here. Make sure
                to restart your webui after installing them.
            </p>
            <ul>
                <li><GithubLink href="https://github.com/adieyal/sd-dynamic-prompts/tree/main">Dynamic Prompts</GithubLink></li>
                <li><GithubLink href="https://github.com/GooeyAvocado/sd-wildcard-browser">Wildcard Browser</GithubLink></li>
            </ul>
            <p>
                With Dynamic Prompts, you can add wildcards to your prompt, where one value will be picked from
                a given text file. You can specify where the wildcard will be placed by using two underscores (IE: __body_types__)
                Wildcard values can contain other wildcards, LoRAs, or other Dynamic Prompt syntax.
                Your text files for wildcards should be placed here:
            </p>
            <div style={codeStyle}>/(your webUI root)/extensions/sd-dynamic-prompts/wildcards</div>
            <p>
                With the Wildcard Browser extension, Chamomile will be able to look into those wildcards to allow you
                to add, and pre-select values in your prompt.
            </p>
            <p>
                Overrides, wildcard presets, and variables run until no instances of them exist in the prompt to generate,
                or until there's been 5 iterations of replacing, whichever comes first. This means you can add
                overrides on top of overrides, or wildcard presets for wildcards called on another selected wildcard preset
            </p>
            <p>
                Chamomile will save both the actual prompt used by your WebUI to generate the image, named the "Prompt",
                and the prompt with the wildcards, variables, and overrides un-replaced, named the "Base Prompt",
                so you can re-use a template from any generated image.
            </p>
            <p>
                All variables, wildcard presets, and overrides persist during your time on a Chamomile tab, and when loading
                or brewing existing images or recipes.
            </p>
            <p>
                Dynamic Prompts have a very rich syntax and feature set that you can learn more about in
                their <Link href="https://github.com/adieyal/sd-dynamic-prompts/blob/main/docs/SYNTAX.md">documentation</Link>.
            </p>
        </HelpSection>

        <HelpSection title="What are Variables and Overrides" >
            <img src="/screenshots/overrides.png" style={{ width: "100%" }} />
            <p>
                Along with wildcards, Chamomile supports two other ways to alter a prompt at generation time
            </p>
            <h2 style={{ fontFamily: 'Merriweather' }}>Overrides</h2>
            <p>
                Overrides serve as a simple search and replace for prompts. It's mostly useful in case you want to
                replace a call to a specific LoRA (say a PonyXL LoRA for an Illustrious equivalent), or replacing more
                complex Dynamic Prompt syntax, without altering the base prompt or needing to individually edit existing
                saved recipes.
            </p>
            <h2 style={{ fontFamily: 'Merriweather' }}>Variables (Deprecated)</h2>
            <p>
                Variables were originally implemented as part of Chamomile 1.0. These are defined in your prompt
                between percent symbols (IE: %myVar%), and can have multiple values separated by the pipe symbol which are then
                used sequentially when queuing. IE: If your variable is set to "red|blue|green" and you queue 3 images to generate,
                the first would fill the value as "red", the second with "blue", and the third with "green".
            </p>
            <p>
                This system is now deprecated, because Dynamic Prompts has an existing and more robust variable system.
            </p>
            <hr />
            <p>
                Overrides, wildcard presets, and variables run until no instances of them exist in the prompt to generate,
                or until there's been 5 iterations of replacing, whichever comes first. This means you can add
                overrides on top of overrides, or wildcard presets for wildcards called on another selected wildcard preset
            </p>
            <p>
                Chamomile will save both the actual prompt used by your WebUI to generate the image, named the "Prompt",
                and the prompt with the wildcards, variables, and overrides un-replaced, named the "Base Prompt",
                so you can re-use a template from any generated image.
            </p>
            <p>
                All variables, wildcard presets, and overrides persist during your time on a Chamomile tab, and when loading
                or brewing existing images or recipes.
            </p>
        </HelpSection>

        <HelpSection title="Comments on Prompts">
            <p>
                Chamomile lets you write comments on your prompts in a few ways. This is useful especially if you want to disable certain
                parts of a prompt, or leave some notes and structure for later. Comments are removed at generation time, so your Web UI will
                never see them. However, they are preserved on the Base Prompt, so you can see them later.
            </p>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Format</TableCell>
                        <TableCell>Sample</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>#This entire line is commented</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>//</TableCell>
                        <TableCell>//This entire line is also commented</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>/**/</TableCell>
                        <TableCell>This section isn't commented /*but this one is*/</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </HelpSection>

        <HelpSection title="Advanced Prompting Techniques" >
            <img src="/screenshots/expandedPromptBar.png" width={"100%"} />
            Chamomile allows you to fine tune your results with more than just a prompt, models, and LoRAs.
            Clicking the <LabeledIcon label="More Options"> <ExpandMore /></LabeledIcon> button on the prompt bar reveals
            additional settings for your prompts including

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <div>
                    <b><LabeledIcon label="Negative Prompt"><ThumbDown /></LabeledIcon></b>: What the diffusion model should avoid
                </div>

                <div>
                    <b><LabeledIcon label="Amount"><Coffee /></LabeledIcon></b>: Amount of images to enqueue when you hit {BrewButton}
                </div>

                <div>
                    <b><LabeledIcon label="Width"><Height sx={{ transform: 'rotate(90deg)', }} /></LabeledIcon> &
                        <LabeledIcon label="Height"><Height style={{ marginRight: "-10px" }} /></LabeledIcon></b>:  Determines the dimensions of your image.
                    <p>Clicking either icon on this textbox will bring up a modal with common size presets</p>
                </div>

                <div>
                    <b><LabeledIcon label="Steps"><DirectionsRun /></LabeledIcon></b>: Amount of iterations the diffusion model should run for.
                    <img src="/images/charts/steps.png" width={"100%"} />
                    <p>
                        Think of this as how long your image will "brew" for. Fewer steps are like a quick coffee
                        brew—faster, but with less detail and subtlety. More steps allow for richer, more refined
                        images, but take longer to generate. However, just like over-brewing coffee, increasing
                        steps beyond a certain point won't improve quality and may even waste time, as image
                        improvements eventually plateau.
                    </p>
                    <p>10 steps or less are usually too un-detailed, while more than 30 usually nets no benefit in quality</p>
                </div>

                <div>
                    <b><LabeledIcon label="CFG Scale"><Tune /></LabeledIcon></b>: Controls how strictly the model follows your prompt.
                    <img src="/images/charts/cfg.png" width={"100%"} />
                    <p>
                        Think of this like adjusting
                        the coffee-to-water ratio when brewing coffee: a higher CFG Scale is like using more coffee grounds for a stronger, more defined flavor
                        (closer to your prompt), while a lower CFG Scale is like using less coffee for a milder, more subtle result (more creative freedom for the model).
                    </p>
                    <p>
                        You can add too much water and then there's no taste (no image), and you can add too much coffee and then it's
                        too acrid (too much image). Staying around 2.0 to 7.0 is usually good enough for most models.
                    </p>
                </div>
                <div>
                    <b><LabeledIcon label="Sampler"><Window /></LabeledIcon></b>: Determines the algorithm used to generate your image.
                    <img src="/images/charts/sampler.png" width={"100%"} />
                    <p>
                        Think of the sampler like choosing a brewing method for coffee—French press, espresso, pour-over, etc. Each method
                        extracts flavors differently, resulting in unique tastes and textures. Similarly, different samplers can produce subtle
                        or dramatic changes in your image's style, detail, and consistency.
                    </p>
                    <p><i>While all samplers are presented, most models will tell you which sampler to pick. This is usually either DPM++ 2M for
                        realistic results, or Euler A for softer, more cartoonish results.
                    </i></p>
                </div>
                {/* This is left here in case we ever want to bring this back */}
                {/* <div>
                    <b><LabeledIcon label="Scheduler"><Schedule /></LabeledIcon></b>: Controls the schedule or timing of how noise is added and 
                    removed during the image generation process.
                    <p>
                        Think of the scheduler like setting a timer or schedule for a slow-cooker recipe—different timing strategies can affect 
                        how flavors develop and blend. Similarly, different schedulers influence how the image evolves step by step, impacting 
                        the final look and feel.
                    </p>
                    <p><i>Most users can stick with the default scheduler for their sampler, but experimenting with others can sometimes yield 
                        different artistic results or improve consistency for certain models.</i></p>
                </div> */}
                <div>
                    <b><LabeledIcon label="Seed"><Yard /></LabeledIcon></b>: Seed to generate the initial noise of the image
                    <p>
                        Not all coffee beans are equal, and neither is the noise that's used to kick off generation. Set this to a specific value
                        if you want to adjust a prompt with finer tweaks and subtler differences between generations.
                    </p>
                    <p>
                        Clicking the seed icon on this box will generate a new random seed. Setting this value to -1 will use a random seed.
                    </p>
                    <p>
                        Your seed value is also used to select wildcards. Prompts with the same seed will always choose the same wildcard value!
                    </p>
                    <p><i>
                        If you wish to experiment further without saving each image,
                        you can use the <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Preview Recipe</Card> option in
                        the {BrewButton} button's menu

                    </i></p>
                </div>
            </div>
        </HelpSection>

        <HelpSection title="Previewing Recipes">
            <img src="/screenshots/preview.png" width={"70%"} />
            <p>
                Sometimes you may want to experiment without necessarily saving a bunch of images to get there
                on Chamomile. You can use
                the <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Preview Recipe</Card> option
                in the {BrewButton} button's menu to launch the preview dialog.
            </p>
            <p>
                You can edit the prompt and the image preview on
                the top will a few seconds after your last edit. By default, previews are generated at 10 steps instead of 30
                to make their generation faster. It may take a bit if Chamomile has a queue and is busy.
            </p>
            <p>
                The preview dialog will also generate using the same seed to make sure only
                your changes to your prompt affect the preview. You can re-roll your seed by clicking
                on the <LabeledIcon label="Seed"><Yard /></LabeledIcon> button on the lower left.
            </p>
            <p>
                When you're satisfied, you can hit
                the <Button variant="contained" style={{ transform: "scale(.8)" }}>Use Recipe</Button> to
                load the recipe you've previewed to the main prompt box. Or you
                can <Button color="secondary" style={{ transform: "scale(.8)" }}>Discard</Button> the prompt
                to close the dialog.
            </p>

        </HelpSection>

        <HelpSection title="Prompts vs Base Prompts" >
            <img src="screenshots/imageContextMenu.png" width={"60%"} />
            <p>
                When you right click on an image, you may be confused by seeing two options relating to the image's prompt.
            </p>
            <p>
                Chamomile will save both the actual prompt used by your WebUI to generate the image, named the "Prompt",
                and the prompt with the wildcards, variables, and overrides un-replaced, named the "Base Prompt",
                so you can re-use a template from any generated image.
            </p>
            <div style={{ display: 'flex', flexWrap: "wrap", gap: "20px" }}>
                <Card style={{ minWidth: width < 400 ? "0px" : "400px", flex: "1" }}>
                    <CardContent>
                        <LabeledIcon label="Prompt"><Coffee /></LabeledIcon>
                        <div style={codeStyle}>
                            man made of blue slime, slime man, slime, melting,
                            liquid hair, <b>((furry)), dog, canine, anthro</b>, blue
                            skin, <b>twink, chubby</b>, transparent skin, translucent
                            skin, polo, sweatpants, waving, looking at viewer,
                            smile
                        </div>
                    </CardContent>
                </Card>
                <Card style={{ minWidth: width < 400 ? "0px" : "400px", flex: "1" }}>
                    <CardContent>
                        <LabeledIcon label="Base Prompt"><CoffeeOutlined /></LabeledIcon>
                        <div style={codeStyle}>
                            # The Googgo<br />
                            man made of blue slime, slime man, slime, melting, liquid hair, <b>__species__</b>, blue
                            skin, <b>__body_types__</b>, transparent skin, translucent skin, polo, sweatpants,
                            waving, looking at viewer, smile
                        </div>
                    </CardContent>
                </Card>

            </div>
            <p>
                All variables, wildcard presets, and overrides persist during your time on a Chamomile tab, and when loading
                or brewing existing images or recipes.
            </p>
        </HelpSection>

        <HelpSection title="Reusing Prompts" >
            <p>
                There are a few ways to reuse prompts form images in Chamomile.
            </p>
            <p>
                Each will let you choose to
                either <LabeledIcon label="Use this prompt"><Terminal /></LabeledIcon> , which will load its
                details onto the main prompt box, or
                immediately <LabeledIcon label="Brew"><Coffee /></LabeledIcon> the amount currently set on
                the prompt box.
            </p>
            <p>
                Additionally, each will let you use either the
                <LabeledIcon label="Prompt"><Coffee /></LabeledIcon>, or
                the <LabeledIcon label="Base Prompt"><CoffeeOutlined /></LabeledIcon> (if it is available).
            </p>
            <p>The first is by right clicking an image from the home grid:</p>
            <img src="screenshots/imageContextMenu.png" width={"60%"} />
            <p>
                The second and third ways are on the image display. You can select from the bottom nav options, where base or full prompts
                can be chosen from a pop up menu when clicking either option:
            </p>
            <img src="screenshots/imageNavGrid.png" width={"60%"} />
            <p>
                You can also view the prompts and select from either of the two on the top right portion of the screen. Whether this is
                the full or base prompt is determined by which of the two is currently being displayed
            </p>
            <img src="screenshots/imagePrompt.png" width={"60%"} />
        </HelpSection>

        <HelpSection title="Saving Recipes" >
            <img src="/screenshots/saveRecipe.png" width={"50%"} />

            <p>
                Just like an excellent coffee recipe, sometimes we want to save a prompt to re-use it later. You can either favorite an image and
                find it through search, or you can specifically save a recipe. To do this, look in the menu on the {BrewButton} button, and
                click <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Save this recipe</Card> option.
            </p>
            <p>
                Once your recipe is saved, you can browse, edit, and load recipes using
                the <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Load a recipe</Card> or
                make further alterations and overwrite or save your current recipe as another name.
            </p>

        </HelpSection>

        <HelpSection title="Collections">
            <img src="/screenshots/collection.png" width={"100%"} />

            <p>
                Chamomile allows you to set up collections of images, which can automatically add images that match a custom search query. To
                view them, Click on the <LabeledIcon label="Collections"><PhotoLibrary /></LabeledIcon> icon on the top of the screen.
            </p>

            <p>
                Here you can set up and view existing collections, and search images within
                your collections. <b>Important note:</b> Deleting images in a collection will
                delete the image for real!
            </p>

            <p>
                While viewing collections, you will not be able to view brewing or recently brewed images.
                When you're ready to keep brewing or see new results, click
                the <LabeledIcon label="Brewery"><ModelTraining /></LabeledIcon> icon on the top of the screen

            </p>

            <hr />
            <img src="/screenshots/collectionsFromSearch.png" width={"100%"} />
            <p>
                You can also create collections using the searchbar on the home page. Simply type a search
                query and then click the <LabeledIcon label="Create collection from this search"><LibraryAdd /></LabeledIcon> icon.
                Chamomile will also ask you if you want to add all existing images that match the search query text to this
                new collection.
            </p>

            <p>
                Images will automatically be added to the collection if there's a search query tied
                to the collection. If you want to disable this, simply edit and untick this option. This will
                clear the search query.
            </p>

        </HelpSection>

        <HelpSection title="Upscaling Images" >
            <img src="/screenshots/upscaling.png" width={"70%"} />
            <p>
                Images that have been added to Chamomile can be upscaled using your Web UI. You can select which upscaler and
                by how much to upscale the image. The upscaled image is saved on Chamomile, and will be immediately available
                for download.
            </p>
            <p>
                While your Web UI might come bundled with several uspcalers, we personally recommend RealESRGAN models, which can
                be downloaded and placed in the following directory:
            </p>
            <div style={codeStyle}>
                /(your webUI root)/models/RealESRGAN
            </div>
        </HelpSection>

        <HelpSection title="Viewing Your Statistics" >
            <img src="/screenshots/stats.png" style={{ width: "70%" }} />
            <p>
                You can view usage statistics for both LoRA and Model usage by clicking
                the <LabeledIcon label="Statistics"><BarChart /></LabeledIcon> button along
                the top of the screen. These statistics are based on your search query. If it is
                blank, it'll show global overall statistics. You can further refine this to
                show only models that are available or unavailable, and a limit to how many
                images to analyze
            </p>
        </HelpSection>

        <HelpSection title="Advanced Full Text Search">
            <AdvSearchHelp />
        </HelpSection>

        <HelpSection title="Additional Search Options" >
            <img src="/screenshots/expandedSearch.png" style={{ width: "100%" }} />
            <p>
                Along with searching by text, you can go a little further by refining search criteria
                by hitting the <LabeledIcon label="More Options"> <ExpandMore /></LabeledIcon> button
                in the search box, revealing additional settings. These include:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <div>
                    <b><LabeledIcon label="Favorites"><Star htmlColor="gold" /></LabeledIcon></b>: Only show favorite images
                </div>
                <div>
                    <b><LabeledIcon label="Upscaled"><Gradient color="info" /></LabeledIcon></b>: Only show upscaled images
                </div>
                <div>
                    <b><LabeledIcon label="To and From dates"><CalendarMonth /></LabeledIcon></b>: Inclusive date ranges for search results
                </div>

                <div>
                    <b><LabeledIcon label="Models and LoRAs"><ModelTraining /></LabeledIcon></b>: Only show images that use either this model or LoRA
                </div>
            </div>

        </HelpSection>

        <HelpSection title="The Chamomile Display" >
            <img src="/screenshots/display.png" width={"100%"} />
            <p>
                The Chamomile Display is designed to keep a look at what Chamomile is generating. We generally expect this to be run on a second monitor or
                a different computer. Once an image is generated, it keeps a small buffer of images that have been generated, and you can flip through them
                on an image viewer. The image viewer will automatically pull a newly generated image if it's on the latest previous image.
            </p>
            <p>
                While it's meant for viewing only, you can still hit the <LabeledIcon label="Menu"><Menu /></LabeledIcon> button on the top right of the
                screen to bring up more information, and to brew more of the image based on their prompt or base prompt.
            </p>
            <p>The Chamomile Display can be launched from the <LabeledIcon label="Display"><Monitor /></LabeledIcon> button</p>
        </HelpSection>

        <HelpSection title="Keyboard Shortcuts">
            <h2 style={{ fontFamily: "Merriweather" }}>On the Prompt Box</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Key Combination</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "S"])}</TableCell>
                        <TableCell>Save Recipe</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "SHIFT", "S"])}</TableCell>
                        <TableCell>Save Recipe As</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "O"])}</TableCell>
                        <TableCell>Load Recipe</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "ENTER"])}</TableCell>
                        <TableCell>
                            Hits the {BrewButton} button
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <h2 style={{ fontFamily: "Merriweather" }}>On the Image Viewer</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Key Combination</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "S"])}</TableCell>
                        <TableCell>Save Image</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["DEL"])}</TableCell>
                        <TableCell>Delete Image</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["SHIFT", "DEL"])}</TableCell>
                        <TableCell>Delete Image without asking</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["<-"])}</TableCell>
                        <TableCell>
                            Previous Image
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["->"])}</TableCell>
                        <TableCell>
                            Next Image
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </HelpSection>

    </HelpDisplay>

}